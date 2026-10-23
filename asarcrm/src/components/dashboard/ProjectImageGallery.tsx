import { useState, useRef } from "react";
import { Plus, X, Upload, GripVertical } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { db, uploadPublicFile, removePublicFile } from "@/lib/database";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, orderBy } from "@/lib/database";

interface ProjectImage {
  id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
}

interface ProjectImageGalleryProps {
  projectId: string;
  projectName: string;
}

export function ProjectImageGallery({ projectId, projectName }: ProjectImageGalleryProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: images = [] } = useQuery({
    queryKey: ['project-images', projectId],
    queryFn: async () => {
      const q = query(
        collection(db, "project_images"),
        where("project_id", "==", projectId),
        orderBy("display_order")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ProjectImage[];
    }
  });

  const uploadImage = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user!.id}/${projectId}/${Date.now()}.${fileExt}`;

      const publicUrl = await uploadPublicFile("project-images", fileName, file);

      // Save to database
      await addDoc(collection(db, "project_images"), {
        project_id: projectId,
        user_id: user!.id,
        image_url: publicUrl,
        caption: caption || null,
        display_order: images.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-images', projectId] });
      toast.success("Image uploaded");
      setCaption("");
      setIsUploading(false);
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  });

  const deleteImage = useMutation({
    mutationFn: async (image: ProjectImage) => {
      // Delete from database
      await deleteDoc(doc(db, "project_images", image.id));

      // Try to delete from storage
      try {
        await removePublicFile("project-images", image.image_url);
      } catch (e) {
        console.error("Failed to delete from storage:", e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-images', projectId] });
      toast.success("Image deleted");
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be under 5MB");
        return;
      }
      uploadImage.mutate(file);
    }
    e.target.value = "";
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Images ({images.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project Images - {projectName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Section */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="Optional caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="bg-muted/50"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || images.length >= 10}
            >
              {isUploading ? (
                "Uploading..."
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Image
                </>
              )}
            </Button>
          </div>

          {images.length >= 10 && (
            <p className="text-sm text-muted-foreground">Maximum 10 images per project.</p>
          )}

          {/* Image Grid */}
          {images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No images yet</p>
              <p className="text-sm text-muted-foreground">Upload up to 10 images for this project.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((image) => (
                <div key={image.id} className="group relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image.image_url}
                    alt={image.caption || "Project image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => deleteImage.mutate(image)}
                      className="p-2 rounded-lg bg-destructive/80 hover:bg-destructive text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent">
                      <p className="text-xs text-foreground truncate">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
