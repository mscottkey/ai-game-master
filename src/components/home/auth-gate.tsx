
"use client";

import { useAuth } from "@/components/home/auth-provider";
import { Button } from "@/components/ui/button";
import { NewCampaignDialog } from "@/components/home/new-campaign-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, LogIn, LogOut, Mail } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ExistingCampaignsList } from "./existing-campaigns-list";

function EmailSignInDialog({ onSignIn }: { onSignIn: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email);
    setOpen(false); // Close the dialog after submission
  };

  return (
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Mail className="mr-2" />
          Sign In with Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Sign in with your email</DialogTitle>
            <DialogDescription>
              We'll send a secure, passwordless sign-in link to your email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="col-span-3"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send Sign-In Link</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function AuthGate() {
  const { user, signInWithGoogle, signInWithEmail, logOut, loading } = useAuth();

  if (loading) {
    return <div className="h-11 w-48 animate-pulse rounded-md bg-muted" />;
  }

  if (!user) {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button onClick={signInWithGoogle} size="lg">
          <LogIn className="mr-2" />
          Sign In with Google
        </Button>
        <EmailSignInDialog onSignIn={signInWithEmail} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
       <div className="flex items-center gap-4">
        <p className="text-muted-foreground">Welcome back,</p>
         <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar>
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{user.displayName || user.email}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <NewCampaignDialog />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              <BookOpen className="mr-2" />
              Join Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Join Existing Campaign</DialogTitle>
              <DialogDescription>
                Enter the session code provided by your Game Master to join the adventure.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="session-code" className="text-right">
                  Session Code
                </Label>
                <Input id="session-code" placeholder="Enter code..." className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Join Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ExistingCampaignsList user={user} />

    </div>
  );
}
