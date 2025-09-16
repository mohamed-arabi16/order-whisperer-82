import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z.string().optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

/**
 * A page component that displays a contact form and company information.
 *
 * @returns {JSX.Element} The rendered contact page.
 */
const Contact = (): JSX.Element => {
  const { t, isRTL } = useTranslation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { error } = await supabase.functions.invoke("submit-contact-form", {
      body: values,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Your message has been sent successfully.",
      });
      form.reset();
    }
  };

  return (
    <div
      className="min-h-screen bg-background pt-24"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-4">
          {t("contact.title")}
        </h1>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          {t("contact.description")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("contact.formTitle")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.nameLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("contact.namePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.emailLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t("contact.emailPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.subjectLabel")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("contact.subjectPlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contact.messageLabel")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("contact.messagePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting
                        ? "Sending..."
                        : t("contact.submitButton")}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Our Information</CardTitle>
              </CardHeader>
              <CardContent className={`space-y-4 ${isRTL ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>mohamed.arabi16@icloud.com</span>
                </div>
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                  <span dir="ltr">+905380130948</span>
                </div>
                <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                  <span>Istanbul, Turkey</span>
                </div>
                <div className={`flex gap-4 pt-4 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    <Twitter />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    <Linkedin />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    <Github />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
