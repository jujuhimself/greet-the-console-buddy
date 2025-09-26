
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, Lightbulb, TrendingUp, Package, Pill, Stethoscope } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { treatmentGuidelines, findGuidelines, TreatmentGuideline } from "@/data/treatmentGuidelines";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const ChatbotAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your pharmacy assistant. I can help you with inventory insights, restock suggestions, and generate invoices. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "What’s the first-line treatment for malaria in adults?",
        "What’s the dosage for paracetamol in children?",
        "Show me inventory insights",
        "Generate sales report",
        "Treatment guidelines",
        "Cardiac arrest protocol"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate bot response (in real implementation, this would call an AI service)
    setTimeout(() => {
      const botResponse = generateBotResponse(messageText);
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const formatGuidelineResponse = (guidelines: TreatmentGuideline[]): string => {
    if (guidelines.length === 0) {
      return "I couldn't find specific treatment guidelines for that condition. Would you like me to search for something else?";
    }

    return guidelines.map(guideline => {
      return `🏥 **${guideline.condition}**\n\n` +
        `🔍 **Common Symptoms:** ${guideline.symptoms.join(', ')}\n\n` +
        `💊 **First-line Treatment:**\n${guideline.firstLine.map(tx => 
          `• ${tx.medication} ${tx.dosage} - ${tx.duration}${tx.notes ? ` (${tx.notes})` : ''}`
        ).join('\n')}\n\n` +
        (guideline.secondLine ? 
          `💊 **Second-line (if needed):**\n${guideline.secondLine.map(tx => 
            `• ${tx.medication} ${tx.dosage} - ${tx.duration}${tx.notes ? ` (${tx.notes})` : ''}`
          ).join('\n')}\n\n` : '') +
        `⚠️ **When to Refer:**\n${guideline.whenToRefer.map(item => `• ${item}`).join('\n')}\n\n` +
        `💡 **Patient Counseling:**\n${guideline.patientCounseling.map(item => `• ${item}`).join('\n')}`;
    }).join('\n\n---\n\n');
  };

  const generateBotResponse = (userMessage: string): Message => {
    const message = userMessage.toLowerCase();

    // --- Dosage calculator helper ---
    const dosageCalculator = (msg: string): Message => {
      const weightMatch = msg.match(/(\d+\.?\d*)\s*(kg|kilograms?)/);
      if (!weightMatch) {
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Please provide patient weight in kg, e.g., "calculate amoxicillin 18 kg".',
          timestamp: new Date(),
        };
      }
      const weight = parseFloat(weightMatch[1]);
      // supported drugs
      if (msg.includes('amoxicillin')) {
        const doseMgPerKg = 25; // example 25 mg/kg/day divided q8h
        const totalDaily = doseMgPerKg * weight;
        const singleDose = totalDaily / 3;
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: `🧮 **Amoxicillin Dose**\n\nWeight: ${weight} kg\nDaily dose: ${doseMgPerKg} mg/kg → **${totalDaily.toFixed(0)} mg/day**\nDivide into 3 doses: **${singleDose.toFixed(0)} mg** every 8 h.`,
          timestamp: new Date(),
        };
      }
      if (msg.includes('paracetamol') || msg.includes('acetaminophen')) {
        const doseMgPerKg = 15; // 15 mg/kg q6h
        const singleDose = doseMgPerKg * weight;
        const maxDaily = 60 * weight;
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: `🧮 **Paracetamol Dose**\n\nWeight: ${weight} kg\nSingle dose: **${singleDose.toFixed(0)} mg** (15 mg/kg) every 6 h.\nDo not exceed **${maxDaily.toFixed(0)} mg** in 24 h.`,
          timestamp: new Date(),
        };
      }
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Supported drugs: amoxicillin, paracetamol. Include weight in kg e.g., "calculate amoxicillin 18 kg".',
        timestamp: new Date(),
      };
    };

    // --- Intent-based queries ---
    // First-line treatment intent
    const firstLineMatch = message.match(/first[- ]?line treatment for (.+)/);
    if (firstLineMatch) {
      const conditionQuery = firstLineMatch[1].trim();
      const guide = findGuidelines(conditionQuery)[0];
      if (guide) {
        const first = guide.firstLine.map(tx => `• ${tx.medication} ${tx.dosage} – ${tx.duration}${tx.notes ? ` (${tx.notes})` : ''}`).join('\n');
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: `🏥 **${guide.condition} – First-line Treatment**\n\n${first}\n\n*Always confirm diagnosis and consider contraindications.*`,
          timestamp: new Date(),
          suggestions: ['Dosage calculator', 'More guidelines']
        };
      }
    }

    // Medication usage intent ("Can I use doxycycline for pneumonia?")
    const useMatch = message.match(/can i use ([a-zA-Z ]+) for ([a-zA-Z ]+)\?/);
    if (useMatch) {
      const drug = useMatch[1].trim();
      const condQuery = useMatch[2].trim();
      const guide = findGuidelines(condQuery)[0];
      if (guide) {
        const inFirst = guide.firstLine.some(tx => tx.medication.toLowerCase().includes(drug));
        const inSecond = (guide.secondLine || []).some(tx => tx.medication.toLowerCase().includes(drug));
        if (inFirst || inSecond) {
          return {
            id: Date.now().toString(),
            type: 'bot',
            content: `✅ Yes, **${drug}** is listed in the standard treatment guideline for **${guide.condition}**${inSecond && !inFirst ? ' (second-line option)' : ''}.\n\nPlease ensure correct dosing and check patient contraindications.`,
            timestamp: new Date(),
            suggestions: ['Show dosage', 'More guidelines']
          };
        }
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: `⚠️ **${drug}** is not listed as a recommended treatment for **${guide.condition}** in the guideline. Consider first-line options instead. When in doubt, consult a pharmacist or clinician.`,
          timestamp: new Date(),
        };
      }
    }

    // Pediatric dosage intent ("dosage for paracetamol in children")
    const doseMatch = message.match(/dosage (?:for )?([a-zA-Z ]+)(?: in children)?/);
    if (doseMatch) {
      const drug = doseMatch[1].trim().toLowerCase();
      if (drug.includes('paracetamol') || drug.includes('acetaminophen')) {
        return {
          id: Date.now().toString(),
          type: 'bot',
          content: `🧮 **Paracetamol Pediatric Dosing**\n\n10–15 mg/kg per dose orally every 6–8 hours (max 60 mg/kg/day).\n\nExample: 15 kg child → 150–225 mg per dose.\nIf weight unknown, use age-based charts. Always verify calculations and monitor total daily intake.`,
          timestamp: new Date(),
          suggestions: ['Calculate paracetamol 15 kg', 'More guidelines']
        };
      }
    }

    // --- Generic guideline utility responses ---
    if (message.includes('dosage') || message.includes('calculate')) {
      return dosageCalculator(message);
    }
    if (message.includes('interaction')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `⚠️ **Drug Interaction Checker**\n\nType two or more drug names separated by commas and I'll look for major interactions.`,
        timestamp: new Date(),
        suggestions: ['Metformin, Ciprofloxacin', 'Warfarin, Amoxicillin', 'Ibuprofen, Prednisolone'],
      };
    }
    if (message.includes('more guidelines') || message.includes('all guidelines') || message === 'treatment guidelines' || message.includes('list guidelines')) {
      const list = treatmentGuidelines.map(g => `• ${g.condition}`).join('\n');
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `📚 **Available Standard Treatment Guidelines**\n\n${list}\n\nAsk me about any of these conditions (e.g., "malaria" or "cardiac arrest protocol").`,
        timestamp: new Date(),
        suggestions: ['Malaria', 'Cardiac arrest', 'Shock'],
      };
    }

    // --- Attempt guideline lookup regardless of keywords ---
    const guidelines = findGuidelines(message);
    if (guidelines.length > 0) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: `💊 **Treatment Guidelines**\n\n${formatGuidelineResponse(guidelines)}\n\n*Note: These are general guidelines. Always consider patient-specific factors and contraindications.*`,
        timestamp: new Date(),
        suggestions: ['More guidelines', 'Dosage calculator', 'Drug interactions'],
      };
    }
    
    if (message.includes('low stock') || message.includes('restock')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Based on your current inventory, I found 5 items that need restocking:\n\n• Paracetamol 500mg (3 units left)\n• Amoxicillin 250mg (1 unit left)\n• Vitamin C Tablets (8 units left)\n• Cough Syrup (2 units left)\n• Bandages (4 units left)\n\nWould you like me to help you create purchase orders for these items?",
        timestamp: new Date(),
        suggestions: ["Create purchase orders", "Show supplier contacts", "Set reorder points"]
      };
    }
    
    if (message.includes('sales') || message.includes('report')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Here's your sales summary for today:\n\n📊 Total Sales: TZS 125,000\n📦 Items Sold: 45 units\n💰 Best Seller: Paracetamol 500mg\n📈 Growth: +15% vs yesterday\n\nYour top categories today:\n1. Pain Relief (40%)\n2. Antibiotics (25%)\n3. Vitamins (20%)\n4. First Aid (15%)",
        timestamp: new Date(),
        suggestions: ["Export detailed report", "Compare with last week", "View customer analytics"]
      };
    }
    
    if (message.includes('invoice') || message.includes('bill')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "I can help you create professional invoices! Here are your options:\n\n• Standard Invoice Template\n• Prescription Invoice Template\n• Bulk Order Invoice Template\n• Recurring Invoice Setup\n\nWhich type of invoice would you like to create?",
        timestamp: new Date(),
        suggestions: ["Standard invoice", "Prescription invoice", "View invoice history"]
      };
    }
    
    if (message.includes('profit') || message.includes('margin')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Here's your profit analysis:\n\n💰 Today's Gross Profit: TZS 45,000\n📊 Average Margin: 36%\n\nTop Profit Makers:\n1. Generic Medications (45% margin)\n2. OTC Supplements (40% margin)\n3. Medical Supplies (32% margin)\n\n⚠️ Low Margin Alert: Brand medications showing 18% margin. Consider reviewing pricing strategy.",
        timestamp: new Date(),
        suggestions: ["Pricing recommendations", "Cost analysis", "Competitor comparison"]
      };
    }
    
    if (message.includes('staff') || message.includes('employee')) {
      return {
        id: Date.now().toString(),
        type: 'bot',
        content: "Staff Performance Overview:\n\n👥 Active Staff: 4 members\n⏰ Today's Hours: 32 total\n🏆 Top Performer: Sarah (15 sales)\n\nDaily Tasks Completed:\n✅ Morning inventory check\n✅ Customer service training\n⏳ Evening stock count (pending)\n\nWould you like to assign new tasks or review performance metrics?",
        timestamp: new Date(),
        suggestions: ["Assign tasks", "Performance reports", "Schedule management"]
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'bot',
      content: "I understand you're asking about pharmacy operations. I can help you with:\n\n• Inventory management and stock alerts\n• Sales reporting and analytics\n• Invoice and billing assistance\n• Staff management insights\n• Restock recommendations\n• Profit margin analysis\n\nWhat specific area would you like to explore?",
      timestamp: new Date(),
      suggestions: [
        "Inventory insights",
        "Sales analytics", 
        "Create invoice",
        "Staff performance"
      ]
    };
  };

  const handleSuggestionClick = useCallback((suggestion: string) => {
    // Handle specific suggestion actions
    if (suggestion === 'View all available guidelines') {
      const allConditions = treatmentGuidelines.map(g => g.condition).join('\n• ');
      const allGuidelinesMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `📚 **Available Treatment Guidelines**\n\nHere are all the conditions I have guidelines for:\n\n• ${allConditions}\n\nType the name of a condition for detailed treatment information.`,
        timestamp: new Date(),
        suggestions: treatmentGuidelines.slice(0, 4).map(g => g.condition)
      };
      setMessages(prev => [...prev, allGuidelinesMessage]);
      return;
    }
    
    // Check if the suggestion matches any condition
    const matchingGuideline = treatmentGuidelines.find(g => 
      g.condition.toLowerCase() === suggestion.toLowerCase()
    );
    
    if (matchingGuideline) {
      const guidelineMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `💊 **Treatment Guidelines**\n\n${formatGuidelineResponse([matchingGuideline])}\n\n*Note: These are general guidelines. Always consider patient-specific factors and contraindications.*`,
        timestamp: new Date(),
        suggestions: [
          'View all available guidelines',
          'Dosage calculator',
          'Drug interactions',
          'Patient counseling tips'
        ]
      };
      setMessages(prev => [...prev, guidelineMessage]);
      return;
    }
    
    // Default behavior for other suggestions
    handleSendMessage(suggestion);
  }, [handleSendMessage]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          Pharmacy AI Assistant
        </h2>
        <p className="text-gray-600 mt-1">Get intelligent treatment guidance and operational support for your pharmacy</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-blue-50" onClick={() => handleSuggestionClick('UTI')}>
            <Pill className="h-3 w-3 mr-1" /> UTI
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-blue-50" onClick={() => handleSuggestionClick('URTI')}>
            <Pill className="h-3 w-3 mr-1" /> Common Cold
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-blue-50" onClick={() => handleSuggestionClick('View all available guidelines')}>
            <Pill className="h-3 w-3 mr-1" /> All Guidelines
          </Badge>
        </div>
      </div>

      <Card className="h-96">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Pharmacy Assistant Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages Container */}
          <div className="h-64 overflow-y-auto space-y-3 p-2 border rounded-lg bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'bot' && <Bot className="h-4 w-4 mt-1 text-blue-500" />}
                    {message.type === 'user' && <User className="h-4 w-4 mt-1" />}
                    <div className="flex-1">
                      <div className="whitespace-pre-line text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {message.suggestions && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-blue-50 text-xs"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border shadow-sm p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about your pharmacy operations..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={() => handleSendMessage()} 
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSendMessage("Show me inventory insights")}>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium">Inventory Insights</h3>
            <p className="text-sm text-gray-600">Get stock levels and reorder suggestions</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSendMessage("Generate sales report")}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium">Sales Analytics</h3>
            <p className="text-sm text-gray-600">View performance and trends</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSendMessage("Help me create an invoice")}>
          <CardContent className="p-4 text-center">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-medium">Smart Assistance</h3>
            <p className="text-sm text-gray-600">Get help with daily operations</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotAssistant;
