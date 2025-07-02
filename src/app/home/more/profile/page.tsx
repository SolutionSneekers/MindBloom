
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth, db } from '@/lib/firebase';
import { updateProfile, onAuthStateChanged, User, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLogout } from '@/hooks/use-logout';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { LogOut, ChevronsUpDown, Eye, EyeOff, KeyRound, User as UserIcon, Pencil } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { DatePickerDialog } from '@/components/ui/date-picker-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { defaultAvatars } from '@/lib/avatars';
import { ScrollArea } from '@/components/ui/scroll-area';

const profileSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }).max(50),
  lastName: z.string().min(1, { message: 'Last name is required.' }).max(50),
  photoURL: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  dob: z.date().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Old password is required." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [originalPhotoURL, setOriginalPhotoURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);
  const [isPasswordCollapsibleOpen, setIsPasswordCollapsibleOpen] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { handleLogout } = useLogout();
  
  // State for the avatar dialog
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [dialogPhotoSelection, setDialogPhotoSelection] = useState('');


  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      photoURL: '',
      dob: undefined,
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    },
  });
  
  const photoURL = watch('photoURL');

  const resetPasswordFields = useCallback(() => {
    resetPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  }, [resetPasswordForm]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setOriginalPhotoURL(currentUser.photoURL);
        const nameParts = currentUser.displayName?.split(' ') || ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Fetch additional user data from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let dob;
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.dob && userData.dob instanceof Timestamp) {
            dob = userData.dob.toDate();
          }
        }
        
        reset({
          firstName: firstName,
          lastName: lastName,
          photoURL: currentUser.photoURL || '',
          dob: dob
        });
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [reset]);
  
  const handleAvatarSelect = (dataUri: string) => {
    setDialogPhotoSelection(dataUri);
  };

  const handleRevertToOriginal = () => {
    setDialogPhotoSelection(originalPhotoURL || '');
  };

  const handleApplyAvatar = () => {
    setValue('photoURL', dialogPhotoSelection, { shouldDirty: true, shouldValidate: true });
    setIsAvatarDialogOpen(false);
  };
  
  const handleAvatarDialogOpenChange = (open: boolean) => {
    if (open) {
      // When dialog opens, initialize its state with the current form value
      setDialogPhotoSelection(watch('photoURL') || '');
    }
    setIsAvatarDialogOpen(open);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!auth.currentUser) return;
    
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: `${data.firstName} ${data.lastName}`.trim(),
        photoURL: data.photoURL,
      });

      // Save/update user data in Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        firstName: data.firstName,
        lastName: data.lastName,
        photoURL: data.photoURL,
        dob: data.dob ? Timestamp.fromDate(data.dob) : null,
      }, { merge: true });


      setUser(auth.currentUser);
      setOriginalPhotoURL(auth.currentUser.photoURL);
      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: "An error occurred while updating your profile. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!auth.currentUser?.email) {
        toast({ title: "Error", description: "No user is logged in.", variant: "destructive" });
        return;
    };
    setIsSavingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, data.oldPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, data.newPassword);
      
      toast({
        title: "Password updated!",
        description: "Your password has been changed successfully.",
      });
      resetPasswordFields();
    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/wrong-password') {
        description = "The old password you entered is incorrect. Please try again.";
      } else if (error.code === 'auth/weak-password') {
        description = "The new password is too weak. Please choose a stronger one.";
      }
      toast({
        title: "Error updating password",
        description: description,
        variant: "destructive",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Skeleton for Edit Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-5 w-5" />
          </CardHeader>
        </Card>

        {/* Skeleton for Change Password Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-5 w-5" />
          </CardHeader>
        </Card>

        {/* Skeleton for Account Actions Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>Please <Link href="/" className="underline">log in</Link> to view your profile.</CardDescription>
            </CardHeader>
        </Card>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-headline">Profile</h1>
        <p className="text-muted-foreground">Manage your personal details and account information.</p>
      </div>
      
      <Dialog open={isAvatarDialogOpen} onOpenChange={handleAvatarDialogOpenChange}>
        <Collapsible open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
            <Card className="transition-shadow hover:shadow-md">
                <CollapsibleTrigger className="w-full text-left">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-headline flex items-center gap-2"><UserIcon /> Edit Profile</CardTitle>
                      <CardDescription>Click to expand and edit your profile details.</CardDescription>
                    </div>
                      <ChevronsUpDown className={cn("h-5 w-5 transition-transform duration-300", isCollapsibleOpen && "rotate-180")} />
                  </CardHeader>
                </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-20 w-20 border">
                              <AvatarImage src={photoURL || user.photoURL || "https://placehold.co/80x80.png"} alt={user.displayName || "User"} data-ai-hint="profile" />
                              <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <DialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-background group-hover:bg-muted"
                                >
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Change avatar</span>
                                </Button>
                            </DialogTrigger>
                        </div>
                        <p className="text-sm text-muted-foreground text-center sm:text-left">
                            Click the pencil to choose a new avatar or provide a custom image URL. <br />
                            Avatars sync with Google if you signed in with that provider.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                            <Input id="firstName" {...register('firstName')} disabled={isSaving} autoComplete="given-name" />
                            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                            <Input id="lastName" {...register('lastName')} disabled={isSaving} autoComplete="family-name" />
                            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                       <Controller
                        control={control}
                        name="dob"
                        render={({ field }) => (
                           <DatePickerDialog
                            value={field.value}
                            onChange={field.onChange}
                            fromYear={new Date().getFullYear() - 120}
                            toYear={new Date().getFullYear()}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        )}
                      />
                      {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={user.email || ''} disabled autoComplete="email" />
                       <p className="text-sm text-muted-foreground">You cannot change your email address here.</p>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </CollapsibleContent>
            </Card>
        </Collapsible>
        <DialogContent className="sm:max-w-lg p-0">
            <DialogHeader className="p-6 pb-4">
                <DialogTitle>Choose Your Avatar</DialogTitle>
                <DialogDescription>
                    Select a default avatar or provide a URL. Click OK to apply your choice.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] border-y">
              <div className="px-6 py-4 space-y-6">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                      {defaultAvatars.map((avatarSvg, index) => {
                        const dataUri = `data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(avatarSvg) : ''}`;
                        return (
                          <button
                              key={index}
                              type="button"
                              className={cn(
                                  "w-full aspect-square flex items-center justify-center p-1 border-2 rounded-full hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all [&_svg]:h-full [&_svg]:w-full",
                                  dataUri === dialogPhotoSelection ? "border-primary bg-accent" : "border-transparent"
                              )}
                              onClick={() => handleAvatarSelect(dataUri)}
                              dangerouslySetInnerHTML={{ __html: avatarSvg }}
                          />
                        )
                      })}
                  </div>
                  
                  <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="photoURL-dialog">Photo URL</Label>
                       <Input
                          id="photoURL-dialog"
                          placeholder="https://example.com/image.png"
                          value={(dialogPhotoSelection || '').startsWith('data:image/svg+xml') ? '' : dialogPhotoSelection || ''}
                          onChange={(e) => setDialogPhotoSelection(e.target.value)}
                      />
                      {errors.photoURL && <p className="text-sm text-destructive">{errors.photoURL.message}</p>}
                  </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4">
                {originalPhotoURL && (
                    <Button type="button" variant="outline" onClick={handleRevertToOriginal} className="mr-auto">
                        Revert to Original Photo
                    </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => setIsAvatarDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleApplyAvatar}>OK</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Collapsible open={isPasswordCollapsibleOpen} onOpenChange={(isOpen) => {
        setIsPasswordCollapsibleOpen(isOpen);
        if (!isOpen) {
          resetPasswordFields();
        }
      }}>
        <Card className="transition-shadow hover:shadow-md">
           <CollapsibleTrigger className="w-full text-left">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-headline flex items-center gap-2"><KeyRound /> Change Password</CardTitle>
                    <CardDescription>Update your password here. Click to expand.</CardDescription>
                </div>
                 <ChevronsUpDown className={cn("h-5 w-5 transition-transform duration-300", isPasswordCollapsibleOpen && "rotate-180")} />
              </CardHeader>
            </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">Old Password <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input id="oldPassword" type={showOldPassword ? 'text' : 'password'} {...registerPassword('oldPassword')} disabled={isSavingPassword} className="pr-10" autoComplete="current-password" />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent" onClick={() => setShowOldPassword(s => !s)}>
                      {showOldPassword ? <Eye /> : <EyeOff />}
                      <span className="sr-only">{showOldPassword ? 'Show password' : 'Hide password'}</span>
                    </Button>
                  </div>
                  {passwordErrors.oldPassword && <p className="text-sm text-destructive">{passwordErrors.oldPassword.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password <span className="text-destructive">*</span></Label>
                   <div className="relative">
                    <Input id="newPassword" type={showNewPassword ? 'text' : 'password'} {...registerPassword('newPassword')} disabled={isSavingPassword} className="pr-10" autoComplete="new-password"/>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent" onClick={() => setShowNewPassword(s => !s)}>
                      {showNewPassword ? <Eye /> : <EyeOff />}
                       <span className="sr-only">{showNewPassword ? 'Show password' : 'Hide password'}</span>
                    </Button>
                  </div>
                  {passwordErrors.newPassword && <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password <span className="text-destructive">*</span></Label>
                   <div className="relative">
                    <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} {...registerPassword('confirmPassword')} disabled={isSavingPassword} className="pr-10" autoComplete="new-password"/>
                    <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:bg-transparent" onClick={() => setShowConfirmPassword(s => !s)}>
                      {showConfirmPassword ? <Eye /> : <EyeOff />}
                       <span className="sr-only">{showConfirmPassword ? 'Show password' : 'Hide password'}</span>
                    </Button>
                  </div>
                  {passwordErrors.confirmPassword && <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>}
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSavingPassword}>
                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>


      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline flex items-center gap-2">Account Actions</CardTitle>
          <CardDescription>Manage your account session.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
