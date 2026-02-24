
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, UserMinus, UserCheck, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { sendTelegramNotification } from '@/lib/notifier';

const AdminUsersManager = () => {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [userToToggle, setUserToToggle] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        department: '',
        role: 'standard'
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('name')
                .order('name');
            if (error) throw error;
            setDepartments(data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('username');

            if (error) throw error;

            let filteredData = data || [];
            if (!isSuperAdmin()) {
                filteredData = filteredData.filter(u => u.role !== 'super_admin');
            }

            setUsers(filteredData);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Error',
                description: 'Failed to load users: ' + error.message,
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNewUser = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', full_name: '', department: '', role: 'standard' });
        setIsDialogOpen(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            password: user.password,
            full_name: user.full_name || '',
            department: user.department || '',
            role: user.role
        });
        setIsDialogOpen(true);
    };

    const handleToggleStatusClick = (user) => {
        if (user.id === currentUser?.id) {
            toast({
                title: 'Action Prohibited',
                description: 'You cannot deactivate your own account.',
                variant: 'destructive'
            });
            return;
        }
        if (user.role === 'super_admin' && !isSuperAdmin()) {
            toast({
                title: 'Action Prohibited',
                description: 'You do not have permission to modify a Super Admin.',
                variant: 'destructive'
            });
            return;
        }
        setUserToToggle(user);
        setIsStatusDialogOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!userToToggle) return;

        try {
            const newStatus = !userToToggle.is_active;
            const { error } = await supabase
                .from('users')
                .update({ is_active: newStatus, updated_at: new Date().toISOString() })
                .eq('id', userToToggle.id);

            if (error) throw error;

            setUsers(users.map(u => u.id === userToToggle.id ? { ...u, is_active: newStatus } : u));
            toast({
                title: `User ${newStatus ? 'Activated' : 'Deactivated'}`,
                description: `The user has been successfully ${newStatus ? 'activated' : 'deactivated'}.`
            });

            // Send Telegram Notification
            try {
                const action = newStatus ? "Activated" : "Deactivated";
                const emoji = newStatus ? "🔓" : "🔒";
                const message = `${emoji} *User ${action}*\n\n` +
                    `Username: \`${userToToggle.username}\`\n` +
                    `By: \`${currentUser.fullName}\``;
                await sendTelegramNotification(message);
            } catch (notifyErr) {
                console.error('Error sending Telegram notification:', notifyErr);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update user status: ' + error.message,
                variant: 'destructive'
            });
        } finally {
            setIsStatusDialogOpen(false);
            setUserToToggle(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userData = {
                username: formData.username,
                password: formData.password,
                full_name: formData.full_name,
                department: formData.department,
                role: formData.role,
                updated_at: new Date().toISOString()
            };

            if (editingUser) {
                const { error } = await supabase
                    .from('users')
                    .update(userData)
                    .eq('id', editingUser.id);

                if (error) throw error;
                toast({ title: 'User Updated', description: 'User details updated successfully.' });
            } else {
                const { error } = await supabase
                    .from('users')
                    .insert([userData]);

                if (error) throw error;
                toast({ title: 'User Created', description: 'New user added successfully.' });
            }

            // Send Telegram Notification
            try {
                const action = editingUser ? "Updated" : "Added";
                const emoji = editingUser ? "✏️" : "👤";
                const message = `${emoji} *User ${action}*\n\n` +
                    `Username: \`${formData.username}\`\n` +
                    `Full Name: \`${formData.full_name}\`\n` +
                    `Department: \`${formData.department}\`\n` +
                    `Role: \`${formData.role}\`\n` +
                    `${action} By: \`${currentUser.fullName}\``;
                await sendTelegramNotification(message);
            } catch (notifyErr) {
                console.error('Error sending Telegram notification:', notifyErr);
            }

            setIsDialogOpen(false);
            fetchUsers();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save user: ' + error.message,
                variant: 'destructive'
            });
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500">Manage application users and their roles</p>
                </div>
                <Button onClick={handleNewUser} className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Add User
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600 w-[200px]">Username</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Full Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Department</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Role</th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                            <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-sm">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                        {user.username}
                                        {user.id === currentUser?.id && (
                                            <span className="text-[10px] bg-green-100 text-green-500 px-1.5 py-.5 rounded-md font-bold uppercase tracking-wider">
                                                You
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm">{user.full_name || '-'}</td>
                                <td className="py-3 px-4 text-sm">{user.department || '-'}</td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {(user.role === 'admin' || user.role === 'super_admin') && <Shield className="w-3 h-3 mr-1" />}
                                        {user.role === 'super_admin' ? 'Superadmin' : user.role === 'admin' ? 'Admin' : 'Standard'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.is_active ? 'Active' : 'Deactivated'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                            <Pencil className="w-4 h-4 text-gray-600" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleStatusClick(user)}
                                            className={`${user.is_active ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'text-green-500 hover:text-green-700 hover:bg-green-50'} disabled:opacity-30 disabled:hover:bg-transparent`}
                                            disabled={user.id === currentUser?.id}
                                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                        >
                                            {user.is_active ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="text"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="department">Department</Label>
                            <Select
                                value={formData.department}
                                onValueChange={(val) => setFormData({ ...formData, department: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.name} value={dept.name}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                    {departments.length === 0 && (
                                        <SelectItem value="" disabled>No departments found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(val) => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    {isSuperAdmin() && <SelectItem value="super_admin">Super Admin</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{userToToggle?.is_active ? 'Deactivate User?' : 'Activate User?'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {userToToggle?.is_active
                                ? 'Are you sure you want to deactivate this user? They will no longer be able to log in to the system.'
                                : 'Are you sure you want to reactivate this user? They will regain access to the system.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmToggleStatus}
                            className={userToToggle?.is_active ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
                        >
                            {userToToggle?.is_active ? 'Deactivate' : 'Activate'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminUsersManager;
