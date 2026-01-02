'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Facebook, CheckCircle2, ExternalLink, Loader2, 
  AlertCircle, Info
} from 'lucide-react';
import { useFacebookPages, useSelectFacebookPage } from '@/hooks/api/use-facebook';
import { cn } from '@/lib/utils';

export function FacebookPageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, error } = useFacebookPages();
  const selectPageMutation = useSelectFacebookPage();

  const handleSelectPage = async (pageId: string) => {
    try {
      await selectPageMutation.mutateAsync(pageId);
      setIsOpen(false);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const selectedPage = data?.pages?.find(p => p.is_selected);

  return (
    <>
      {/* Trigger Button */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Facebook className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Facebook Page</CardTitle>
                <p className="text-sm text-gray-600 mt-0.5">
                  {selectedPage ? `Posting to: ${selectedPage.name}` : 'No page selected'}
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              variant="outline"
              size="sm"
            >
              {selectedPage ? 'Change Page' : 'Select Page'}
            </Button>
          </div>
        </CardHeader>
        
        {selectedPage && (
          <CardContent>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-blue-200">
              {selectedPage.picture_url && (
                <img 
                  src={selectedPage.picture_url}
                  alt={selectedPage.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">{selectedPage.name}</p>
                <p className="text-xs text-gray-600">{selectedPage.category}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Selection Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="h-6 w-6 text-blue-600" />
              Select Facebook Page
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-semibold">Failed to load pages</p>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  {(error as any)?.message || 'Unknown error'}
                </p>
              </div>
            ) : data && data.pages.length === 0 ? (
              // No Pages Found
              <div className="text-center py-12">
                <div className="mb-4 inline-block p-4 bg-blue-100 rounded-full">
                  <Facebook className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Facebook Pages Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  You need to create a Facebook Page to post via our app. 
                  Facebook Pages are required for posting through the API.
                </p>
                <Button
                  asChild
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <a 
                    href="https://www.facebook.com/pages/create" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Create a Facebook Page
                  </a>
                </Button>
              </div>
            ) : (
              // Pages List
              <div className="space-y-3">
                {data?.pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleSelectPage(page.id)}
                    disabled={selectPageMutation.isPending}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      page.is_selected 
                        ? "border-blue-500 bg-blue-50 shadow-md" 
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {page.picture_url && (
                        <img 
                          src={page.picture_url}
                          alt={page.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{page.name}</p>
                          {page.is_selected && (
                            <Badge className="bg-blue-600">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{page.category}</p>
                      </div>

                      {page.is_selected ? (
                        <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Posts will be published to the selected Facebook Page. 
                You can change this selection at any time.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}