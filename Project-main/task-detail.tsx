import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Upload } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

const proofSchema = z.object({
  proofText: z.string().min(1, 'Please provide some description of your task completion'),
  proofImage: z.string().optional(),
});

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuthContext();
  const { getTask, submitTask, isSubmittingTask } = useTasks(user?.id);
  const { toast } = useToast();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const { data: task, isLoading } = getTask(parseInt(id));

  const form = useForm<z.infer<typeof proofSchema>>({
    resolver: zodResolver(proofSchema),
    defaultValues: {
      proofText: '',
      proofImage: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof proofSchema>) => {
    if (!user || !task) return;
    
    let proofData = {
      taskId: task.id,
      userId: user.id,
      proofText: values.proofText,
    };

    // If image exists, convert to base64 and include in submission
    if (imageFile) {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onload = () => {
        submitTask({
          taskId: task.id,
          data: {
            ...proofData,
            proofImage: reader.result as string
          }
        });
      };
    } else {
      submitTask({
        taskId: task.id,
        data: proofData
      });
    }

    // Navigate back to home after successful submission
    toast({
      title: "Proof Submitted",
      description: "Your task completion proof has been submitted for review."
    });
    navigate('/');
  };

  // Check if user is the task owner
  const isTaskOwner = task && user ? task.ownerId === user.id : false;

  useEffect(() => {
    if (isTaskOwner) {
      toast({
        variant: "destructive",
        title: "Cannot complete own task",
        description: "You cannot complete a task you created."
      });
      navigate('/');
    }
  }, [isTaskOwner, navigate, toast]);

  return (
    <div>
      <header className="bg-card py-4 px-4 flex items-center shadow-md">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Task Details</h1>
      </header>
      
      <main className="px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : task ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{task.name}</h2>
                
                <div className="grid grid-cols-2 gap-y-3 text-sm mt-4">
                  <div className="text-muted-foreground">Task Owner:</div>
                  <div>{task.ownerEmail}</div>
                  
                  <div className="text-muted-foreground">Price:</div>
                  <div className="text-secondary font-semibold">₦{task.pricePerUser}</div>
                  
                  <div className="text-muted-foreground col-span-2 pt-2">Task Description:</div>
                  <div className="col-span-2 bg-muted p-3 rounded-md">
                    {task.description}
                  </div>
                  
                  <div className="text-muted-foreground col-span-2 pt-2">Task Link:</div>
                  <div className="col-span-2">
                    <a href={task.link} target="_blank" rel="noopener noreferrer" className="text-primary underline break-all">
                      {task.link}
                    </a>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Submit Proof of Completion</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={form.control}
                        name="proofText"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how you completed the task..." 
                                className="resize-none h-24" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="border border-dashed border-border rounded-lg p-4 text-center bg-muted">
                        <input 
                          type="file" 
                          className="hidden" 
                          id="proofImage" 
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        <label htmlFor="proofImage" className="cursor-pointer">
                          <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                          <p className="text-sm text-muted-foreground">
                            {imagePreview ? 'Change screenshot' : 'Click to upload screenshot'}
                          </p>
                        </label>
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-2 bg-muted rounded-md overflow-hidden">
                          <img src={imagePreview} alt="Proof screenshot" className="w-full h-auto max-h-60 object-contain" />
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full gradient-bg gradient-shine"
                        disabled={isSubmittingTask}
                      >
                        {isSubmittingTask ? 'Submitting...' : 'Submit Proof'}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Task not found</p>
          </div>
        )}
      </main>
    </div>
  );
}
