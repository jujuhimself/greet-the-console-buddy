import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/orderService';
import { appointmentService } from '@/services/appointmentService';
import type { PlatformOrder, PlatformOrderCreate } from '@/services/orderService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { financialService } from '@/services/financialService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import LabResults from '@/components/individual/LabResults';

const swahiliGreetings = ["habari", "shikamoo", "mambo", "vipi", "salama"]; // simple Swahili detection

const PersonalHealth = () => {
  const [activeTab, setActiveTab] = useState<'hiv' | 'circumcision' | 'chatbot'>('hiv');
  const [hivPharmacies, setHivPharmacies] = useState<any[]>([]);
  const [loadingHiv, setLoadingHiv] = useState(false);
  const [circumcisionClinics, setCircumcisionClinics] = useState<any[]>([]);
  const [loadingCircumcision, setLoadingCircumcision] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotMode, setChatbotMode] = useState<'hiv' | 'circumcision' | null>(null);
  const [chatStep, setChatStep] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ from: 'bot' | 'user', text: string }[]>([]);
  const [prescreenAnswers, setPrescreenAnswers] = useState<any>({});
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [orderForm, setOrderForm] = useState({ name: '', alias: '', phone: '', address: '', paymentMethod: '', loading: false, error: '', success: false });
  const [bookingForm, setBookingForm] = useState({ name: '', age: '', phone: '', notes: '', timeSlot: '', loading: false, error: '', success: false });
  const [assistantView, setAssistantView] = useState<'quick' | 'order' | 'booking' | 'chat'>('quick');
  const [bookedSlots, setBookedSlots] = useState<{ date: string, time: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  // For the time picker, use 30-min increments
  const timeOptions = Array.from({ length: 21 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2);
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${min}`;
  });

  useEffect(() => {
    if (activeTab === 'hiv') {
      setLoadingHiv(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'retail')
        .eq('self_test_available', true)
        .then(({ data, error }) => {
          setHivPharmacies(data || []);
          setLoadingHiv(false);
        });
    }
    if (activeTab === 'circumcision') {
      setLoadingCircumcision(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'lab')
        .eq('offers_circumcision', true)
        .then(({ data, error }) => {
          setCircumcisionClinics(data || []);
          setLoadingCircumcision(false);
        });
    }
  }, [activeTab]);

  useEffect(() => {
    if (chatbotOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [chatHistory, chatbotOpen]);

  // Fetch all booked appointments when booking modal opens
  useEffect(() => {
    if (assistantView === 'booking') {
      supabase
        .from('appointments')
        .select('appointment_date, appointment_time')
        .then(({ data }) => {
          if (data) {
            setBookedSlots(data.map((a: any) => ({ date: a.appointment_date, time: a.appointment_time })));
          } else {
            setBookedSlots([]);
          }
        });
    }
  }, [assistantView]);

  useEffect(() => {
    if (orderForm.success) {
      toast({ title: 'Order Successful', description: 'Your order has been placed!' });
      setTimeout(() => navigate('/checkout-success'), 1200);
    }
  }, [orderForm.success, toast, navigate]);

  // Chatbot logic handler
  const handleChatSubmit = () => {
    const input = chatInput.trim();
    if (!input) return;
    setChatHistory(h => [...h, { from: 'user', text: input }]);
    setChatInput('');
    // Swahili fallback
    if (swahiliGreetings.some(g => input.toLowerCase().includes(g))) {
      setChatHistory(h => [...h, { from: 'bot', text: 'Karibu! Naweza kujibu maswali yako kuhusu afya yako binafsi. Una swali gani leo?' }]);
      return;
    }
    // HIV Self-Test Flow
    if (chatbotMode === 'hiv') {
      if (chatStep === 0) {
        setChatHistory(h => [...h, { from: 'bot', text: 'Would you like to know more about how HIV self-testing works?' }]);
        setChatStep(1);
        return;
      }
      if (chatStep === 1) {
        if (/yes|yep|sure|ok|yeah/i.test(input)) {
          setChatHistory(h => [...h,
            { from: 'bot', text: 'HIV self-testing lets you check your HIV status privately, using a kit at home.' },
            { from: 'bot', text: 'The tests are highly accurate when used correctly.' },
            { from: 'bot', text: 'You can order a kit here and it will be delivered discreetly.' },
            { from: 'bot', text: 'Would you like step-by-step instructions on how to use the test?' }
          ]);
          setChatStep(2);
        } else {
          setChatHistory(h => [...h, { from: 'bot', text: 'No problem. If you have any questions or feel anxious, I am here to support you.' }]);
        }
        return;
      }
      if (chatStep === 2) {
        if (/yes|yep|sure|ok|yeah/i.test(input)) {
          setChatHistory(h => [...h,
            { from: 'bot', text: '1. Wash your hands and read the kit instructions.' },
            { from: 'bot', text: '2. Collect a sample (usually saliva or a finger prick).' },
            { from: 'bot', text: '3. Wait for the result as per the kit instructions.' },
            { from: 'bot', text: '4. If positive, seek confirmatory testing at a clinic. If negative, continue regular testing as needed.' },
            { from: 'bot', text: 'Remember, your status does not define you. We can talk through the next steps together — at your pace.' }
          ]);
          setChatStep(3);
        } else {
          setChatHistory(h => [...h, { from: 'bot', text: 'Okay. If you want to talk through the process or have questions, I am here.' }]);
        }
        return;
      }
      // Emotional support
      if (/scared|worried|afraid|anxious|don\'t want to know|fear/i.test(input)) {
        setChatHistory(h => [...h, { from: 'bot', text: "You're not alone. Many people feel this way. When you're ready, I'm here to walk you through it." }]);
        return;
      }
      setChatHistory(h => [...h, { from: 'bot', text: 'Is there anything else you would like to know about HIV self-testing?' }]);
      return;
    }
    // Circumcision Flow
    if (chatbotMode === 'circumcision') {
      if (chatStep === 0) {
        setChatHistory(h => [...h, { from: 'bot', text: 'Are you looking to book a circumcision appointment or learn more about it?' }]);
        setChatStep(1);
        return;
      }
      if (chatStep === 1) {
        if (/learn|info|information|about/i.test(input)) {
          setChatHistory(h => [...h,
            { from: 'bot', text: 'Circumcision is a minor surgical procedure to remove the foreskin from the penis.' },
            { from: 'bot', text: 'It is recommended for health, hygiene, and sometimes religious or cultural reasons.' },
            { from: 'bot', text: 'The procedure is quick, usually done under local anesthesia, and recovery takes about a week.' },
            { from: 'bot', text: 'For individuals aged 15+, it is free and confidential at participating clinics.' },
            { from: 'bot', text: 'Would you like to book an appointment or ask more questions?' }
          ]);
          setChatStep(2);
        } else if (/book|appointment|schedule/i.test(input)) {
          setChatHistory(h => [...h, { from: 'bot', text: 'Great! May I ask your age?' }]);
          setChatStep(10);
        } else {
          setChatHistory(h => [...h, { from: 'bot', text: 'I can provide information or help you book. Please type "learn" or "book".' }]);
        }
        return;
      }
      if (chatStep === 2) {
        if (/book|appointment|schedule/i.test(input)) {
          setChatHistory(h => [...h, { from: 'bot', text: 'Great! May I ask your age?' }]);
          setChatStep(10);
        } else {
          setChatHistory(h => [...h, { from: 'bot', text: 'Feel free to ask any more questions about circumcision.' }]);
        }
        return;
      }
      // Prescreening
      if (chatStep === 10) {
        setPrescreenAnswers(a => ({ ...a, age: input }));
        if (parseInt(input) < 15) {
          setChatHistory(h => [...h, { from: 'bot', text: 'Circumcision is only available for individuals aged 15 and above. If you have questions, I can connect you to a healthcare provider.' }]);
          setChatStep(0);
          return;
        }
        setChatHistory(h => [...h, { from: 'bot', text: 'Have you ever been diagnosed with a bleeding disorder (e.g., hemophilia)?' }]);
        setChatStep(11);
        return;
      }
      if (chatStep === 11) {
        setPrescreenAnswers(a => ({ ...a, bleeding: input }));
        setChatHistory(h => [...h, { from: 'bot', text: 'Are you currently experiencing pain or inflammation in the genital area?' }]);
        setChatStep(12);
        return;
      }
      if (chatStep === 12) {
        setPrescreenAnswers(a => ({ ...a, pain: input }));
        setChatHistory(h => [...h, { from: 'bot', text: 'Have you been circumcised before?' }]);
        setChatStep(13);
        return;
      }
      if (chatStep === 13) {
        setPrescreenAnswers(a => ({ ...a, circumcised: input }));
        setChatHistory(h => [...h, { from: 'bot', text: 'Are you comfortable receiving a circumcision under local anesthesia?' }]);
        setChatStep(14);
        return;
      }
      if (chatStep === 14) {
        setPrescreenAnswers(a => ({ ...a, anesthesia: input }));
        // Check for concerning answers
        const concerning = [prescreenAnswers.bleeding, prescreenAnswers.pain, input].some(ans => /yes|yep|true/i.test(ans));
        if (concerning) {
          setChatHistory(h => [
            ...h,
            { from: 'bot', text: "Thanks for your honesty. You may need a personalized consultation with a healthcare provider. Would you like me to help you schedule one?" }
          ]);
          setChatStep(0);
        } else {
          setChatHistory(h => [
            ...h,
            { from: 'bot', text: "You're eligible. I can help you book an appointment at a nearby clinic now." }
          ]);
          setChatStep(15);
        }
        return;
      }
      if (chatStep === 15) {
        setChatHistory(h => [...h, { from: 'bot', text: 'Would you like a summary of this conversation sent to your inbox, or do you prefer to keep it here for now?' }]);
        setChatStep(0);
        return;
      }
      setChatHistory(h => [...h, { from: 'bot', text: 'Would you like to learn more or book an appointment?' }]);
      return;
    }
    // For HIV (after instructions or support):
    if (chatbotMode === 'hiv' && chatStep === 3) {
      setChatHistory(h => [
        ...h,
        { from: 'bot', text: 'Ready to order your HIV self-test kit? <button class="bepawa-action-btn" data-action="order">Order Now</button>' }
      ]);
      setChatStep(100); // End
      return;
    }
    // For Circumcision (after eligibility):
    if (chatbotMode === 'circumcision' && chatStep === 15) {
      setChatHistory(h => [
        ...h,
        { from: 'bot', text: 'You are eligible. <button class="bepawa-action-btn" data-action="book">Book Appointment</button>' }
      ]);
      setChatStep(100); // End
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-blue-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4 bg-pink-100 text-pink-700 border-pink-200 text-lg">Personal Health</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Health, Your Privacy</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Access sensitive healthcare services — like HIV self-testing and circumcision — privately, safely, and with dignity. No judgment, no stigma.
          </p>
        </div>
        <div className="flex justify-center gap-4 mb-8">
          <Button variant={activeTab === 'hiv' ? 'default' : 'outline'} onClick={() => setActiveTab('hiv')}>🧪 HIV Self-Test Kits</Button>
          <Button variant={activeTab === 'circumcision' ? 'default' : 'outline'} onClick={() => setActiveTab('circumcision')}>✂️ Circumcision</Button>
          <Button variant={activeTab === 'chatbot' ? 'default' : 'outline'} onClick={() => setActiveTab('chatbot')}>🤖 Health Assistant</Button>
        </div>
        {/* HIV Self-Test Kits Section */}
        {activeTab === 'hiv' && (
          <section id="hiv" className="mb-10">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order HIV Self-Test Kits Privately</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">Browse and order HIV self-test kits from trusted pharmacies. Your order is private and discreet. Optionally use an alias at checkout.</p>
                {loadingHiv ? (
                  <div className="text-center text-gray-400 py-8">Loading pharmacies...</div>
                ) : hivPharmacies.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No pharmacies found offering HIV self-test kits.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {hivPharmacies.map(pharmacy => (
                      <Card key={pharmacy.id} className="border-0 shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg">{pharmacy.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-gray-600 mb-2">{pharmacy.address}</div>
                          <div className="text-gray-500 text-sm mb-2">{pharmacy.phone}</div>
                          <Button
                            className="w-full bg-pink-600 hover:bg-pink-700 text-white mt-2"
                            onClick={() => {
                              setChatbotMode('hiv');
                              setChatbotOpen(true);
                              setChatStep(0);
                              setChatHistory([{ from: 'bot', text: "I'm here to support you. Would you like to know more about how HIV self-testing works?" }]);
                              setSelectedPharmacy(pharmacy);
                            }}
                          >
                            Order Discreetly
                          </Button>
                          <div className="text-xs text-gray-400 mt-2">Alias/anonymous checkout supported</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
        {/* Circumcision Booking Section */}
        {activeTab === 'circumcision' && (
          <section id="circumcision" className="mb-10">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Book Circumcision Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">Book a confidential circumcision appointment at a trusted clinic. Free for individuals aged 15+.</p>
                {loadingCircumcision ? (
                  <div className="text-center text-gray-400 py-8">Loading clinics...</div>
                ) : circumcisionClinics.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No clinics found offering circumcision.</div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {circumcisionClinics.map(clinic => (
                      <Card key={clinic.id} className="border-0 shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg">{clinic.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-gray-600 mb-2">{clinic.address}</div>
                          <div className="text-gray-500 text-sm mb-2">{clinic.phone}</div>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                            onClick={() => {
                              setChatbotMode('circumcision');
                              setChatbotOpen(true);
                              setChatStep(0);
                              setChatHistory([{ from: 'bot', text: "I'm here to help you with circumcision information and booking." }]);
                              setSelectedClinic(clinic);
                            }}
                          >
                            Start Booking (with Chatbot)
                          </Button>
                          <div className="text-xs text-gray-400 mt-2">Prescreening required for privacy and safety</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}
        {/* Chatbot Section */}
        {activeTab === 'chatbot' && (
          <section id="chatbot" className="mb-10">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About Personal Health Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-700">
                  The Personal Health Assistant is here to provide you with confidential support, guidance, and answers to your questions about HIV self-testing and circumcision. Use the tabs above to access services. Your privacy and dignity are always protected.
                </p>
                <ul className="list-disc pl-6 text-gray-600">
                  <li>🧪 Order HIV self-test kits privately and discreetly.</li>
                  <li>✂️ Book a confidential circumcision appointment (free for 15+).</li>
                  <li>🤖 Chatbot support is available when you start an order or booking.</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        )}
        <LabResults />
      </div>
      <Dialog open={chatbotOpen} onOpenChange={setChatbotOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Health Assistant</DialogTitle>
          </DialogHeader>
          {assistantView === 'quick' && (
            <div className="flex flex-col gap-4 py-4">
              <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={() => setAssistantView('order')}>Order HIV Self-Test Kit</Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setAssistantView('booking')}>Book Circumcision Appointment</Button>
              <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={() => setAssistantView('chat')}>FAQs / Ask a Question</Button>
            </div>
          )}
          {assistantView === 'order' && (
            <div>
              <Button variant="ghost" className="mb-2" onClick={() => setAssistantView('quick')}>← Back to Quick Actions</Button>
              {orderForm.success ? (
                <div className="text-green-700 text-center py-6">
                  <p>Your order has been placed successfully and will be delivered discreetly.</p>
                  <Button className="mt-4 w-full" onClick={() => { setOrderModalOpen(false); setOrderForm({ name: '', alias: '', phone: '', address: '', paymentMethod: '', loading: false, error: '', success: false }); setAssistantView('quick'); setChatbotOpen(false); }}>Close</Button>
                </div>
              ) : (
                <form onSubmit={async e => {
                  e.preventDefault();
                  if (!user) {
                    toast({ title: 'Login Required', description: 'Please log in to place an order.', variant: 'destructive' });
                    navigate('/login');
                    return;
                  }
                  setOrderForm(f => ({ ...f, loading: true, error: '' }));
                  try {
                    if (orderForm.paymentMethod === 'Card') {
                      // Create order in DB
                      const orderData: PlatformOrderCreate = {
                        user_id: user.id,
                        order_type: 'retail',
                        order_number: undefined,
                        total_amount: 1000, // TODO: Replace with actual price
                        status: 'completed',
                        payment_status: 'paid',
                        payment_method: 'Card',
                        shipping_address: { name: orderForm.name, alias: orderForm.alias, phone: orderForm.phone, address: orderForm.address },
                        items: [{ product_name: 'HIV Self-Test Kit', quantity: 1, unit_price: 1000, total_price: 1000, pharmacy_id: selectedPharmacy?.id, pharmacy_name: selectedPharmacy?.name }],
                      };
                      await orderService.createPlatformOrder(orderData);
                      // Add financial transaction
                      await financialService.addTransaction({
                        type: 'income',
                        amount: 1000, // TODO: Replace with actual price
                        category: 'Sales',
                        description: 'HIV Self-Test Kit',
                        transaction_date: new Date().toISOString().split('T')[0],
                      });
                      setOrderForm(f => ({ ...f, loading: false, success: true }));
                    } else {
                      // Pay on Delivery or Mobile Money: create order immediately
                      const orderData: PlatformOrderCreate = {
                        user_id: user.id,
                        order_type: 'retail',
                        order_number: undefined,
                        total_amount: 0,
                        status: 'pending',
                        payment_status: 'unpaid',
                        payment_method: orderForm.paymentMethod,
                        shipping_address: { name: orderForm.name, alias: orderForm.alias, phone: orderForm.phone, address: orderForm.address },
                        items: [{ product_name: 'HIV Self-Test Kit', quantity: 1, unit_price: 0, total_price: 0, pharmacy_id: selectedPharmacy?.id, pharmacy_name: selectedPharmacy?.name }],
                      };
                      await orderService.createPlatformOrder(orderData);
                      setOrderForm(f => ({ ...f, loading: false, success: true }));
                    }
                  } catch (err: any) {
                    setOrderForm(f => ({ ...f, loading: false, error: err.message || 'Failed to place order.' }));
                  }
                }} className="space-y-4">
                  <p>Ordering from: <b>{selectedPharmacy?.name || 'Select a pharmacy from the main page'}</b></p>
                  <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm">Name (or alias):</label>
                    <Input value={orderForm.name} onChange={e => setOrderForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name or alias" required />
                    <label className="text-xs text-gray-500">You may use an alias for privacy.</label>
                    <label className="text-sm mt-2">Phone:</label>
                    <Input value={orderForm.phone} onChange={e => setOrderForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" required />
                    <label className="text-sm mt-2">Delivery Address:</label>
                    <Input value={orderForm.address} onChange={e => setOrderForm(f => ({ ...f, address: e.target.value }))} placeholder="Delivery address" required />
                    <label className="text-sm mt-2">Payment Method:</label>
                    <select className="border rounded px-2 py-1" value={orderForm.paymentMethod} onChange={e => setOrderForm(f => ({ ...f, paymentMethod: e.target.value }))} required>
                      <option value="">Select payment method</option>
                      <option value="Pay on Delivery">Pay on Delivery</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>
                  {orderForm.error && <div className="text-red-600 text-sm">{orderForm.error}</div>}
                  {orderForm.paymentMethod === 'Card' ? (
                    <form className="mt-4 space-y-4" onSubmit={async (e) => {
                      e.preventDefault();
                      setOrderForm(f => ({ ...f, loading: true, error: '' }));
                      try {
                        // Create order in DB
                        const orderData: PlatformOrderCreate = {
                          user_id: user.id,
                          order_type: 'retail',
                          order_number: undefined,
                          total_amount: 1000, // TODO: Replace with actual price
                          status: 'completed',
                          payment_status: 'paid',
                          payment_method: 'Card',
                          shipping_address: { name: orderForm.name, alias: orderForm.alias, phone: orderForm.phone, address: orderForm.address },
                          items: [{ product_name: 'HIV Self-Test Kit', quantity: 1, unit_price: 1000, total_price: 1000, pharmacy_id: selectedPharmacy?.id, pharmacy_name: selectedPharmacy?.name }],
                        };
                        await orderService.createPlatformOrder(orderData);
                        // Add financial transaction
                        await financialService.addTransaction({
                          type: 'income',
                          amount: 1000, // TODO: Replace with actual price
                          category: 'Sales',
                          description: 'HIV Self-Test Kit',
                          transaction_date: new Date().toISOString().split('T')[0],
                        });
                        setOrderForm(f => ({ ...f, loading: false, success: true }));
                      } catch (err: any) {
                        setOrderForm(f => ({ ...f, loading: false, error: err.message || 'Failed to place order.' }));
                      }
                    }}>
                      <Input className="bg-blue-50 border-blue-200 focus:ring-blue-500" placeholder="Cardholder Name" required />
                      <Input className="bg-blue-50 border-blue-200 focus:ring-blue-500" placeholder="Card Number" required maxLength={19} />
                      <div className="flex gap-2">
                        <Input className="bg-blue-50 border-blue-200 focus:ring-blue-500" placeholder="MM/YY" required maxLength={5} />
                        <Input className="bg-blue-50 border-blue-200 focus:ring-blue-500" placeholder="CVC" required maxLength={4} />
                      </div>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white text-lg py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-green-600 transition-all duration-200" type="submit" disabled={orderForm.loading}>
                        {orderForm.loading ? 'Processing...' : 'Pay with Card'}
                      </Button>
                    </form>
                  ) : (
                    <Button className="mt-4 w-full" type="submit" disabled={orderForm.loading}>{orderForm.loading ? 'Placing Order...' : 'Place Order'}</Button>
                  )}
                </form>
              )}
            </div>
          )}
          {assistantView === 'booking' && (
            <div>
              <Button variant="ghost" className="mb-2" onClick={() => setAssistantView('quick')}>← Back to Quick Actions</Button>
              {bookingForm.success ? (
                <div className="text-green-700 text-center py-6">
                  <p>Your appointment has been booked successfully. The clinic will contact you for confirmation.</p>
                  <Button className="mt-4 w-full" onClick={() => { setBookingModalOpen(false); setBookingForm({ name: '', age: '', phone: '', notes: '', timeSlot: '', loading: false, error: '', success: false }); setAssistantView('quick'); setChatbotOpen(false); }}>Close</Button>
                </div>
              ) : (
                <form onSubmit={async e => {
                  e.preventDefault();
                  setBookingForm(f => ({ ...f, loading: true, error: '' }));
                  try {
                    await appointmentService.createAppointment({
                      user_id: user?.id,
                      provider_id: selectedClinic?.id,
                      appointment_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
                      appointment_time: selectedTime,
                      service_type: 'circumcision',
                      provider_type: 'lab',
                      status: 'scheduled',
                      notes: `Age: ${bookingForm.age}. ${bookingForm.notes}`,
                    });
                    setBookingForm(f => ({ ...f, loading: false, success: true }));
                  } catch (err: any) {
                    setBookingForm(f => ({ ...f, loading: false, error: err.message || 'Failed to book appointment.' }));
                  }
                }} className="space-y-4">
                  <p>Booking at: <b>{selectedClinic?.name || 'Select a clinic from the main page'}</b></p>
                  <div className="flex flex-col gap-2 mt-4">
                    <label className="text-sm">Name:</label>
                    <Input value={bookingForm.name} onChange={e => setBookingForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
                    <label className="text-sm mt-2">Age:</label>
                    <Input value={bookingForm.age} onChange={e => setBookingForm(f => ({ ...f, age: e.target.value }))} placeholder="Your age" required type="number" min="15" />
                    <label className="text-sm mt-2">Phone:</label>
                    <Input value={bookingForm.phone} onChange={e => setBookingForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone number" required />
                    <label className="text-sm mt-2">Notes (optional):</label>
                    <Input value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes for the clinic?" />
                    <label className="text-sm mt-2">Preferred Date:</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date) => setSelectedDate(date)}
                      minDate={new Date()}
                      filterDate={date => {
                        // Allow all dates, time disables are handled below
                        return true;
                      }}
                      className="border rounded px-2 py-1"
                      required
                    />
                    <label className="text-sm mt-2">Preferred Time:</label>
                    <select className="border rounded px-2 py-1" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} required>
                      <option value="">Select time</option>
                      {timeOptions.map(time => {
                        const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
                        const isBooked = bookedSlots.some(slot => slot.date === dateStr && slot.time === time);
                        return <option key={time} value={time} disabled={isBooked}>{time} {isBooked ? '(Booked)' : ''}</option>;
                      })}
                    </select>
                  </div>
                  {bookingForm.error && <div className="text-red-600 text-sm">{bookingForm.error}</div>}
                  <Button className="mt-4 w-full" type="submit" disabled={bookingForm.loading}>{bookingForm.loading ? 'Booking...' : 'Book Appointment'}</Button>
                </form>
              )}
            </div>
          )}
          {assistantView === 'chat' && (
            <div>
              <Button variant="ghost" className="mb-2" onClick={() => setAssistantView('quick')}>← Back to Quick Actions</Button>
              <div className="space-y-2 max-h-96 overflow-y-auto mb-2">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={msg.from === 'bot' ? 'text-left' : 'text-right'}>
                    <span
                      className={msg.from === 'bot' ? 'bg-blue-50 px-3 py-2 rounded-lg inline-block' : 'bg-gray-100 px-3 py-2 rounded-lg inline-block'}
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={e => { e.preventDefault(); handleChatSubmit(); }} className="flex gap-2">
                <Input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message..." autoFocus />
                <Button type="submit">Send</Button>
              </form>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatbotOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalHealth; 