import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, Mail, MessageSquare, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NotificationSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [resendSettings, setResendSettings] = useState({
    apiKey: '',
    fromEmail: 'support@bepawaa.com',
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    phoneNumberId: '',
    accessToken: '',
    verifyToken: 'bepawa_whatsapp_verify_9c4f2c5d',
  });

  if (!user || user.role !== 'admin') {
    navigate('/');
    return null;
  }

  const handleSaveResendSettings = async () => {
    if (!resendSettings.apiKey || !resendSettings.fromEmail) {
      toast({
        title: "Missing Information",
        description: "Please fill in all Resend settings",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Note: In production, these should be saved to Supabase secrets via edge function
      // For now, we'll inform the admin to update the secrets manually
      toast({
        title: "Resend Settings",
        description: `Please update the following Supabase secrets:
        • RESEND_API_KEY: ${resendSettings.apiKey}
        • RESEND_FROM_EMAIL: ${resendSettings.fromEmail}
        
        Go to Project Settings → Edge Functions → Secrets in Supabase Dashboard.`,
        duration: 10000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save Resend settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWhatsAppSettings = async () => {
    if (!whatsappSettings.phoneNumberId || !whatsappSettings.accessToken) {
      toast({
        title: "Missing Information",
        description: "Please fill in all WhatsApp settings",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('update-whatsapp-credentials', {
        body: {
          accessToken: whatsappSettings.accessToken,
          phoneNumberId: whatsappSettings.phoneNumberId,
          verifyToken: whatsappSettings.verifyToken,
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "WhatsApp Settings Saved ✓",
        description: "Your WhatsApp credentials have been validated and saved. Make sure to also update WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Supabase secrets.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save WhatsApp settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notification Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure email and messaging notification settings for the platform
        </p>
      </div>

      <Alert className="mb-6">
        <AlertDescription>
          <strong>Important:</strong> After configuring settings here, make sure to update the corresponding secrets in your Supabase project:
          Project Settings → Edge Functions → Secrets
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="resend" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resend">
            <Mail className="h-4 w-4 mr-2" />
            Email (Resend)
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageSquare className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resend">
          <Card>
            <CardHeader>
              <CardTitle>Resend Email Configuration</CardTitle>
              <CardDescription>
                Configure Resend for sending email notifications. All system notifications use a centralized template.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resendApiKey">Resend API Key *</Label>
                <Input
                  id="resendApiKey"
                  type="password"
                  placeholder="re_..."
                  value={resendSettings.apiKey}
                  onChange={(e) => setResendSettings({ ...resendSettings, apiKey: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary underline">Resend Dashboard</a>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resendFrom">From Email Address *</Label>
                <Input
                  id="resendFrom"
                  type="email"
                  placeholder="support@bepawaa.com"
                  value={resendSettings.fromEmail}
                  onChange={(e) => setResendSettings({ ...resendSettings, fromEmail: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Verify your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary underline">Resend Domains</a>
                </p>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>How it works:</strong> All notifications use the <code>sendNotificationEmail</code> function which sends emails via Resend with a consistent branded template.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSaveResendSettings} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Resend Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Configuration</CardTitle>
              <CardDescription>
                Configure WhatsApp Business API for sending message notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappPhoneId">Phone Number ID *</Label>
                <Input
                  id="whatsappPhoneId"
                  placeholder="123456789012345"
                  value={whatsappSettings.phoneNumberId}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, phoneNumberId: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Find this in your WhatsApp Business API Dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappToken">Access Token *</Label>
                <Input
                  id="whatsappToken"
                  type="password"
                  placeholder="EAAG..."
                  value={whatsappSettings.accessToken}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, accessToken: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Generate a permanent token from Meta Business Suite
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappVerify">Verify Token</Label>
                <Input
                  id="whatsappVerify"
                  value={whatsappSettings.verifyToken}
                  onChange={(e) => setWhatsappSettings({ ...whatsappSettings, verifyToken: e.target.value })}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  Use this token when setting up your webhook in Meta
                </p>
              </div>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Setup Guide:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Create a WhatsApp Business account at Meta Business Suite</li>
                    <li>Get your Phone Number ID and Access Token</li>
                    <li>Save credentials here and in Supabase secrets</li>
                    <li>Configure webhook URL in Meta to point to your edge function</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleSaveWhatsAppSettings} 
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Validating...' : 'Validate & Save WhatsApp Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationSettings;
