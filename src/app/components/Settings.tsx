import { useState } from "react";
import { Save, User, Bell, Shield, Globe, Loader2, Camera, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useRole } from "../context/RoleContext";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

import { useAuth } from "../context/AuthContext";

export function Settings() {
  const { userName, role } = useRole();
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.user_metadata?.full_name || userName);
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "(555) 123-4567");
  const [address, setAddress] = useState(user?.user_metadata?.address || "123 Dental Street, Medical City, MC 12345");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name, phone: phone, address: address, avatar_url: avatarUrl }
      });
      if (error) throw error;
      alert("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      
      // Update user metadata immediately
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      alert("Photo uploaded successfully");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (role !== "admin" && role !== "dentist") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="clinic" className="gap-2">
            <Globe className="w-4 h-4" />
            Clinic
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-gray-200">
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="relative group">
                  <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-blue-200 overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-blue-300" />
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Your Photo</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This will be displayed on your profile and dashboard.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                      Change Photo
                    </Button>
                    {avatarUrl && (
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setAvatarUrl(null)}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" defaultValue={role} disabled className="capitalize" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={`${userName.toLowerCase().replace(" ", ".")}@dentalcare.com`}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <p className="text-sm text-gray-500">
                Choose what notifications you want to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">Appointment Reminders</div>
                  <div className="text-sm text-gray-500">
                    Get notified about upcoming appointments
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">Patient Messages</div>
                  <div className="text-sm text-gray-500">
                    Receive notifications for patient messages
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">Low Stock Alerts</div>
                  <div className="text-sm text-gray-500">
                    Alert when inventory items are running low
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-500">
                    Send notifications to your email
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">SMS Notifications</div>
                  <div className="text-sm text-gray-500">
                    Send notifications via SMS
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Security Settings</CardTitle>
              <p className="text-sm text-gray-500">
                Manage your password and security preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinic Settings */}
        <TabsContent value="clinic" className="space-y-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Clinic Information</CardTitle>
              <p className="text-sm text-gray-500">
                Update your clinic details
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Clinic Name</Label>
                <Input id="clinic-name" defaultValue="Async" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-phone">Phone</Label>
                  <Input id="clinic-phone" type="tel" defaultValue="(555) 100-2000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic-email">Email</Label>
                  <Input
                    id="clinic-email"
                    type="email"
                    defaultValue="info@dentalcare.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic-address">Clinic Address</Label>
                <Input
                  id="clinic-address"
                  defaultValue="456 Healthcare Avenue, Medical District, MC 54321"
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="font-medium text-gray-900">Operating Hours</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opening-time">Opening Time</Label>
                    <Input id="opening-time" type="time" defaultValue="08:00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closing-time">Closing Time</Label>
                    <Input id="closing-time" type="time" defaultValue="18:00" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
