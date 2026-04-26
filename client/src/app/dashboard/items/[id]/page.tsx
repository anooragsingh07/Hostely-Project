"use client";

import type { Item } from "@hostely/shared";
import { ArrowLeft, Heart, MapPin, MessageSquare, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { ListingImage } from "@/components/shared/listing-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { H2, H3, Muted } from "@/components/ui/typography";
import { useMe } from "@/features/auth/hooks/use-me";
import { InterestButton } from "@/features/interests/components/interest-button";

const CommentThread = dynamic(
  () =>
    import("@/features/comments/components/comment-thread").then((m) => ({
      default: m.CommentThread,
    })),
  {
    loading: () => (
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    ),
    ssr: false,
  },
);
import { itemsApi } from "@/features/items/services/items.api";
import { formatPrice, formatRelative } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/error-message";

export default function ItemDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useMe();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    itemsApi
      .get(id)
      .then((data) => {
        if (!cancelled) setItem(data);
      })
      .catch((e: unknown) => {
        toast.error(getApiErrorMessage(e, "Could not load listing"));
        router.push("/dashboard/buy");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const isOwner = Boolean(user && item && user.id === item.author.id);

  const onDelete = async () => {
    if (!item) return;
    if (!window.confirm("Delete this listing?")) return;
    try {
      await itemsApi.remove(item.id);
      toast.success("Listing removed");
      router.push("/dashboard/sell");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Could not delete listing"));
    }
  };

  return (
    <AppShell
      title={loading ? "Listing" : (item?.title ?? "Listing")}
      description={loading ? undefined : item?.hostelName}
    >
      <div className="space-y-6">
        <Link
          href="/dashboard/buy"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        {loading && <DetailSkeleton />}

        {!loading && item && (
          <div className="gap-gutter grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <div className="bg-muted relative aspect-[4/3] w-full">
                  {item.images[0] ? (
                    <ListingImage
                      src={item.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs uppercase tracking-wide">
                      {item.category}
                    </div>
                  )}
                </div>
                <CardContent className="space-y-4 p-6">
                  <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="outline" className="capitalize">
                      {item.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {item.condition}
                    </Badge>
                    <Badge
                      variant={item.status === "active" ? "success" : "default"}
                      className="capitalize"
                    >
                      {item.status}
                    </Badge>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {item.hostelName}
                    </span>
                    <span>· {formatRelative(item.createdAt)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <H2 className="text-2xl">{item.title}</H2>
                    <span className="text-2xl font-semibold tabular-nums">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap text-sm">{item.description}</p>
                </CardContent>
              </Card>

              <section className="mt-section">
                <H3 className="mb-3">Comments</H3>
                <CommentThread parentType="item" parentId={item.id} currentUser={user} />
              </section>
            </div>

            <aside className="space-y-4 lg:col-span-2">
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div>
                    <Muted>Seller</Muted>
                    <p className="mt-1 text-base font-semibold">{item.author.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {item.author.hostelName} · {item.author.department}
                    </p>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4" />
                    {item.interestsCount}{" "}
                    {item.interestsCount === 1 ? "person interested" : "people interested"}
                  </div>

                  {isOwner ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => void onDelete()}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete listing
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <InterestButton
                        itemId={item.id}
                        onChange={(marked) =>
                          setItem((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  interestsCount: Math.max(
                                    0,
                                    prev.interestsCount + (marked ? 1 : -1),
                                  ),
                                }
                              : prev,
                          )
                        }
                      />
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/dashboard/chat/${item.author.id}`}>
                          <MessageSquare className="h-4 w-4" />
                          Message seller
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}

const DetailSkeleton = () => (
  <div className="gap-gutter grid grid-cols-1 lg:grid-cols-5">
    <div className="lg:col-span-3">
      <Card className="overflow-hidden">
        <Skeleton className="aspect-[4/3] w-full rounded-none" />
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </CardContent>
      </Card>
    </div>
    <div className="lg:col-span-2">
      <Card>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);
