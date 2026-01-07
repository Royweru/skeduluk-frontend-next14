
import Image from "next/image";
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
} from "@/components/ui/dialog";

interface Post {
id: string;
content: string;
media?: {
    type: "image" | "video";
    url: string;
}[];
createdAt: string;
updatedAt?: string;
}

interface ViewPostModalProps {
open: boolean;
onOpenChange: (open: boolean) => void;
post: Post | null;
}

export function ViewPostModal({
open,
onOpenChange,
post,
}: ViewPostModalProps) {
if (!post) return null;

return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>View Post</DialogTitle>
                <DialogDescription>
                    Posted on {new Date(post.createdAt).toLocaleDateString()}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                {/* Post Content */}
                <div className="text-base leading-relaxed text-foreground">
                    {post.content}
                </div>

                {/* Media Gallery */}
                {post.media && post.media.length > 0 && (
                    <div className="grid grid-cols-1 gap-4">
                        {post.media.map((media, index) => (
                            <div key={index} className="relative w-full">
                                {media.type === "image" ? (
                                    <Image
                                        src={media.url}
                                        alt={`Post media ${index + 1}`}
                                        width={500}
                                        height={500}
                                        className="w-full h-auto rounded-lg object-cover max-h-96"
                                    />
                                ) : (
                                    <video
                                        controls
                                        className="w-full h-auto rounded-lg bg-black max-h-96"
                                    >
                                        <source src={media.url} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t text-sm text-muted-foreground">
                    <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
                    {post.updatedAt && (
                        <p>Updated: {new Date(post.updatedAt).toLocaleString()}</p>
                    )}
                </div>
            </div>
        </DialogContent>
    </Dialog>
);
}