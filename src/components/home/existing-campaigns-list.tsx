
'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getCampaignsForUser, type Campaign } from '@/lib/campaign-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, User as UserIcon, Play } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ExistingCampaignsListProps {
  user: User;
}

function getResumeLink(campaign: Campaign) {
  const params = new URLSearchParams();
  params.set("system", campaign.system);
  if (campaign.campaignPrompt) {
    params.set("campaign", campaign.campaignPrompt);
  }
  if (campaign.characterPrompt) {
    params.set("character", campaign.characterPrompt);
  }
  if (campaign.isLocal) {
    params.set("local", "true");
  }
  // We don't want to use mocks when resuming a real campaign
  params.set("useMocks", "false"); 

  return `/game/${campaign.gameId}?${params.toString()}`;
}


export function ExistingCampaignsList({ user }: ExistingCampaignsListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      const userCampaigns = await getCampaignsForUser(user);
      setCampaigns(userCampaigns);
      setLoading(false);
    };

    fetchCampaigns();
  }, [user]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mt-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
        <div className="w-full max-w-4xl mt-8 text-center text-muted-foreground">
            <p>You haven&apos;t created any campaigns yet.</p>
            <p>Start a new adventure to see it here!</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mt-8">
      <h2 className="text-2xl font-headline font-bold text-center mb-6">Your Campaigns</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="truncate">{campaign.name}</CardTitle>
              <CardDescription>
                {campaign.system.toUpperCase()} &middot;{' '}
                 {formatDistanceToNow(campaign.createdAt.toDate(), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="flex items-center gap-1.5">
                    {campaign.isLocal ? (
                      <>
                        <Users className="w-3 h-3" /> Local
                      </>
                    ) : (
                      <>
                        <UserIcon className="w-3 h-3" /> Virtual
                      </>
                    )}
                </Badge>
              </div>
               <Button asChild>
                  <Link href={getResumeLink(campaign)}>
                    Resume Session
                    <Play className="ml-2" />
                  </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
