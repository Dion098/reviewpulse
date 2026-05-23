"use client";

import * as React from "react";
import { Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleConnectStatus } from "@/components/dashboard/GoogleConnectStatus";

interface ProfileData {
  fullName: string;
  email: string;
}

interface OrgData {
  name: string;
}

interface NotificationSettings {
  emailNewReview: boolean;
  emailWeeklyDigest: boolean;
  smsLowRating: boolean;
}

interface IntegrationData {
  twilioAccountSid: string;
  twilioAuthToken: string;
  googleApiKey: string;
  resendApiKey: string;
}

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  joined_at: string;
}

interface SettingsClientProps {
  googleAccountName: string | null;
  googleStatus: string | null;
}

export function SettingsClient({ googleAccountName, googleStatus }: SettingsClientProps) {
  // Profile
  const [profile, setProfile] = React.useState<ProfileData>({
    fullName: "",
    email: "",
  });
  const [org, setOrg] = React.useState<OrgData>({ name: "" });
  const [plan, setPlan] = React.useState<string>("free");

  const [notifications, setNotifications] = React.useState<NotificationSettings>({
    emailNewReview: true,
    emailWeeklyDigest: true,
    smsLowRating: false,
  });

  const [integrations, setIntegrations] = React.useState<IntegrationData>({
    twilioAccountSid: "",
    twilioAuthToken: "",
    googleApiKey: "",
    resendApiKey: "",
  });

  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = React.useState("");

  // Password change
  const [passwords, setPasswords] = React.useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = React.useState(false);

  // Loading states
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingOrg, setSavingOrg] = React.useState(false);
  const [savingNotifications, setSavingNotifications] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [savingIntegration, setSavingIntegration] = React.useState<string | null>(null);
  const [inviting, setInviting] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setProfile({
          fullName: data.profile?.full_name ?? "",
          email: data.profile?.email ?? "",
        });
        setOrg({ name: data.organization?.name ?? "" });
        setPlan(data.organization?.plan ?? "free");
        setNotifications({
          emailNewReview: data.notifications?.email_new_review ?? true,
          emailWeeklyDigest: data.notifications?.email_weekly_digest ?? true,
          smsLowRating: data.notifications?.sms_low_rating ?? false,
        });
        setIntegrations({
          twilioAccountSid: data.integrations?.twilio_account_sid ?? "",
          twilioAuthToken: data.integrations?.twilio_auth_token ?? "",
          googleApiKey: data.integrations?.google_api_key ?? "",
          resendApiKey: data.integrations?.resend_api_key ?? "",
        });
        if (data.team) setTeamMembers(data.team);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: profile.fullName }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("All password fields are required");
      return;
    }
    if (passwords.next !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.next.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to change password");
      }
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveOrg = async () => {
    if (!org.name.trim()) {
      toast.error("Organization name is required");
      return;
    }
    setSavingOrg(true);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: org.name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Organization updated");
    } catch {
      toast.error("Failed to save organization");
    } finally {
      setSavingOrg(false);
    }
  };

  const handleSaveNotifications = async (
    updated: Partial<NotificationSettings>
  ) => {
    const next = { ...notifications, ...updated };
    setNotifications(next);
    setSavingNotifications(true);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_new_review: next.emailNewReview,
          email_weekly_digest: next.emailWeeklyDigest,
          sms_low_rating: next.smsLowRating,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Failed to save notification preferences");
    } finally {
      setSavingNotifications(false);
    }
  };

  const handleSaveIntegration = async (
    key: keyof IntegrationData,
    fieldName: string
  ) => {
    setSavingIntegration(key);
    try {
      const res = await fetch("/api/settings/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: integrations[key] }),
      });
      if (!res.ok) throw new Error("Failed to save integration");
      toast.success("Integration updated");
    } catch {
      toast.error("Failed to save integration");
    } finally {
      setSavingIntegration(null);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const res = await fetch("/api/settings/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send invitation");
      setInviteEmail("");
      toast.success("Invitation sent");
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (!key || key.length < 8) return key;
    return key.slice(0, 4) + "•".repeat(Math.max(0, key.length - 8)) + key.slice(-4);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <GoogleConnectStatus status={googleStatus} />

      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">API &amp; Integrations</TabsTrigger>
            {plan === "agency" && (
              <TabsTrigger value="team">Team</TabsTrigger>
            )}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profile.fullName}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, fullName: e.target.value }))
                    }
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    disabled
                    className="bg-slate-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="gap-1.5"
                >
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {savingProfile ? "Saving…" : "Save Profile"}
                </Button>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Change Password
                  </h3>
                  <div className="space-y-1.5">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) =>
                          setPasswords((p) => ({
                            ...p,
                            current: e.target.value,
                          }))
                        }
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPasswords ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPasswords ? "text" : "password"}
                      value={passwords.next}
                      onChange={(e) =>
                        setPasswords((p) => ({ ...p, next: e.target.value }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPasswords ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords((p) => ({
                          ...p,
                          confirm: e.target.value,
                        }))
                      }
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Changing…" : "Change Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>
                  Update your organization settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={org.name}
                    onChange={(e) =>
                      setOrg({ name: e.target.value })
                    }
                    placeholder="Your Business Name"
                  />
                </div>
                <Button
                  onClick={handleSaveOrg}
                  disabled={savingOrg}
                  className="gap-1.5"
                >
                  {savingOrg ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {savingOrg ? "Saving…" : "Save"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Choose how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {savingNotifications && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving…
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      New review alert
                    </p>
                    <p className="text-xs text-slate-500">
                      Email me when a new review is posted
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNewReview}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ emailNewReview: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Weekly digest
                    </p>
                    <p className="text-xs text-slate-500">
                      Weekly summary of reviews and ratings
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailWeeklyDigest}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ emailWeeklyDigest: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Critical review SMS alert
                    </p>
                    <p className="text-xs text-slate-500">
                      SMS alert when a 1 or 2-star review is posted
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsLowRating}
                    onCheckedChange={(checked) =>
                      handleSaveNotifications({ smsLowRating: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API & Integrations Tab */}
          <TabsContent value="integrations">
            <div className="space-y-4">
              {/* Google Business Profile */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Google Business Profile</CardTitle>
                    <Badge variant={googleAccountName ? "success" : "secondary"}>
                      {googleAccountName ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Post review replies directly to Google from ReviewPulse.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {googleAccountName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500 shrink-0" />
                        <p className="text-sm text-slate-700">
                          Connected as <span className="font-medium">{googleAccountName}</span>
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        Replies you post in ReviewPulse will be automatically published to Google.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">
                        Connect your Google account to post review replies directly from ReviewPulse.
                      </p>
                      <Button size="sm" asChild>
                        <a href="/api/auth/google">Connect Google Account</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Twilio */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Twilio SMS</CardTitle>
                    <Badge
                      variant={
                        integrations.twilioAccountSid ? "success" : "secondary"
                      }
                    >
                      {integrations.twilioAccountSid
                        ? "Connected"
                        : "Not Connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Used to send SMS review requests to customers.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="twilio-sid">Account SID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="twilio-sid"
                        value={
                          integrations.twilioAccountSid
                            ? maskApiKey(integrations.twilioAccountSid)
                            : ""
                        }
                        onChange={(e) =>
                          setIntegrations((i) => ({
                            ...i,
                            twilioAccountSid: e.target.value,
                          }))
                        }
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="twilio-token">Auth Token</Label>
                    <Input
                      id="twilio-token"
                      type="password"
                      value={integrations.twilioAuthToken}
                      onChange={(e) =>
                        setIntegrations((i) => ({
                          ...i,
                          twilioAuthToken: e.target.value,
                        }))
                      }
                      placeholder="••••••••••••••••••••••••••••••••"
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSaveIntegration(
                        "twilioAccountSid",
                        "twilio_account_sid"
                      )
                    }
                    disabled={savingIntegration === "twilioAccountSid"}
                  >
                    {savingIntegration === "twilioAccountSid"
                      ? "Saving…"
                      : integrations.twilioAccountSid
                      ? "Update"
                      : "Connect"}
                  </Button>
                </CardContent>
              </Card>

              {/* Google Places */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Google Places</CardTitle>
                    <Badge
                      variant={
                        integrations.googleApiKey ? "success" : "secondary"
                      }
                    >
                      {integrations.googleApiKey
                        ? "Connected"
                        : "Not Connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Sync reviews from Google automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="google-key">API Key</Label>
                    <Input
                      id="google-key"
                      value={integrations.googleApiKey}
                      onChange={(e) =>
                        setIntegrations((i) => ({
                          ...i,
                          googleApiKey: e.target.value,
                        }))
                      }
                      placeholder="AIzaSy..."
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSaveIntegration("googleApiKey", "google_api_key")
                    }
                    disabled={savingIntegration === "googleApiKey"}
                  >
                    {savingIntegration === "googleApiKey"
                      ? "Saving…"
                      : integrations.googleApiKey
                      ? "Update"
                      : "Connect"}
                  </Button>
                </CardContent>
              </Card>

              {/* Resend */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Resend Email</CardTitle>
                    <Badge
                      variant={
                        integrations.resendApiKey ? "success" : "secondary"
                      }
                    >
                      {integrations.resendApiKey
                        ? "Connected"
                        : "Not Connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Send email notifications and review requests.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="resend-key">API Key</Label>
                    <Input
                      id="resend-key"
                      value={integrations.resendApiKey}
                      onChange={(e) =>
                        setIntegrations((i) => ({
                          ...i,
                          resendApiKey: e.target.value,
                        }))
                      }
                      placeholder="re_..."
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleSaveIntegration("resendApiKey", "resend_api_key")
                    }
                    disabled={savingIntegration === "resendApiKey"}
                  >
                    {savingIntegration === "resendApiKey"
                      ? "Saving…"
                      : integrations.resendApiKey
                      ? "Update"
                      : "Connect"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Tab (agency plan only) */}
          {plan === "agency" && (
            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Invite colleagues to manage your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Invite form */}
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleInviteTeamMember();
                      }}
                    />
                    <Button
                      onClick={handleInviteTeamMember}
                      disabled={inviting || !inviteEmail.trim()}
                      className="shrink-0"
                    >
                      {inviting ? "Sending…" : "Invite"}
                    </Button>
                  </div>

                  {/* Member list */}
                  {teamMembers.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {teamMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No team members yet. Invite someone above.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}
