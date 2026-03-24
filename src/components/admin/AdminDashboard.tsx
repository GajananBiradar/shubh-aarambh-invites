import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTemplatesTab from './AdminTemplatesTab';
import AdminUsersTab from './AdminUsersTab';
import AdminQuotesTab from './AdminQuotesTab';
import AdminAnalyticsTab from './AdminAnalyticsTab';
import AdminInvitationsTab from './AdminInvitationsTab';
import { Shield } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-2xl font-semibold">Admin Panel</h2>
      </div>
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="bg-muted/50 border border-border rounded-xl p-1 mb-6 flex-wrap h-auto">
          <TabsTrigger value="templates" className="font-body text-sm">Templates</TabsTrigger>
          <TabsTrigger value="users" className="font-body text-sm">Users</TabsTrigger>
          <TabsTrigger value="quotes" className="font-body text-sm">Quotes</TabsTrigger>
          <TabsTrigger value="analytics" className="font-body text-sm">Analytics</TabsTrigger>
          <TabsTrigger value="invitations" className="font-body text-sm">Invitations</TabsTrigger>
        </TabsList>
        <TabsContent value="templates"><AdminTemplatesTab /></TabsContent>
        <TabsContent value="users"><AdminUsersTab /></TabsContent>
        <TabsContent value="quotes"><AdminQuotesTab /></TabsContent>
        <TabsContent value="analytics"><AdminAnalyticsTab /></TabsContent>
        <TabsContent value="invitations"><AdminInvitationsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
