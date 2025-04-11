import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PinnModel } from "@shared/schema";
import { PinnConfig as PinnConfigType } from "@shared/types";

// Schema for PINN configuration
const pinnConfigSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  equationType: z.enum(["ODE", "PDE"]),
  equationFormula: z.string().min(1, "Equation formula is required"),
  physicsLossWeight: z.number().min(0).max(1),
  dataLossWeight: z.number().min(0).max(1),
  boundaryLossWeight: z.number().min(0).max(1),
  parameters: z.record(z.any()),
  boundaryConditions: z.record(z.any()),
  initialConditions: z.record(z.any()),
  domainConstraints: z.record(z.any()),
});

export default function PinnConfig() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch PINN models
  const { data: pinnModels, isLoading: modelsLoading } = useQuery<PinnModel[]>({
    queryKey: ['/api/pinn/models'],
  });

  // Fetch current PINN configuration
  const { data: pinnConfig, isLoading: configLoading } = useQuery<PinnConfigType>({
    queryKey: ['/api/pinn/config'],
  });

  const form = useForm<z.infer<typeof pinnConfigSchema>>({
    resolver: zodResolver(pinnConfigSchema),
    defaultValues: {
      name: "",
      description: "",
      equationType: "ODE",
      equationFormula: "du/dt = a*u*(1-u/K) - b*u*v/(1+c*u)",
      physicsLossWeight: 0.5,
      dataLossWeight: 0.3,
      boundaryLossWeight: 0.2,
      parameters: {
        learningRate: 0.001,
        hiddenLayers: 3,
        nodesPerLayer: 64,
        activationFunction: "tanh",
        epochs: 1000,
        batchSize: 32,
        a: 0.5,
        b: 0.2,
        c: 0.1,
        K: 100,
      },
      boundaryConditions: {
        initial: { t: 0, u: 10, v: 2 },
        terminal: { t: 100 }
      },
      initialConditions: {
        u: 10,
        v: 2
      },
      domainConstraints: {
        t: [0, 100],
        u: [0, 100],
        v: [0, 20]
      },
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (pinnConfig) {
      form.reset({
        name: pinnModels?.[0]?.name || "Default PINN Model",
        description: pinnModels?.[0]?.description || "Physics-Informed Neural Network for dependency modeling",
        equationType: pinnConfig.equationType,
        equationFormula: pinnConfig.equationFormula,
        physicsLossWeight: pinnConfig.physicsLossWeight,
        dataLossWeight: pinnConfig.dataLossWeight,
        boundaryLossWeight: pinnConfig.boundaryLossWeight,
        parameters: pinnConfig.parameters,
        boundaryConditions: pinnConfig.boundaryConditions,
        initialConditions: pinnConfig.initialConditions,
        domainConstraints: pinnConfig.domainConstraints,
      });
    }
  }, [pinnConfig, pinnModels, form]);

  // Save PINN configuration
  const savePinnConfig = useMutation({
    mutationFn: async (data: z.infer<typeof pinnConfigSchema>) => {
      const res = await apiRequest('POST', '/api/pinn/config', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pinn/config'] });
      toast({
        title: "Success",
        description: "PINN configuration saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save PINN configuration",
        variant: "destructive",
      });
    },
  });

  // Train PINN model
  const trainModel = useMutation({
    mutationFn: async (data: z.infer<typeof pinnConfigSchema>) => {
      const res = await apiRequest('POST', '/api/pinn/train', data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pinn/models'] });
      toast({
        title: "Success",
        description: `PINN model training started (ID: ${data.modelId})`,
      });
      simulateTrainingProgress();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start PINN model training",
        variant: "destructive",
      });
      setIsTraining(false);
    },
  });

  // Simulate training progress (in a real app this would be updated via WebSockets)
  const simulateTrainingProgress = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        const newProgress = prev + Math.random() * 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const onSubmit = (values: z.infer<typeof pinnConfigSchema>) => {
    savePinnConfig.mutate(values);
  };

  const handleTrainModel = () => {
    const values = form.getValues();
    trainModel.mutate(values);
  };

  // Format the equation formula with math symbols for display
  const formatEquation = (equation: string) => {
    return equation
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/(\w+)(\^)(\w+)/g, '$1<sup>$3</sup>');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="PINN Configuration" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl font-bold">Physics-Informed Neural Networks</h1>
                <p className="text-muted-foreground">
                  Configure and train Physics-Informed Neural Networks (PINNs) for dependency modeling
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button variant="outline" className="mr-2" disabled={isTraining} onClick={() => form.reset()}>
                  Reset
                </Button>
                <Button 
                  onClick={handleTrainModel} 
                  disabled={isTraining || !form.formState.isValid}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isTraining ? "Training..." : "Train Model"}
                </Button>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>PINN Model Configuration</CardTitle>
                <CardDescription>
                  Configure the parameters for your Physics-Informed Neural Network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="equation">Equation</TabsTrigger>
                    <TabsTrigger value="boundary">Boundary Conditions</TabsTrigger>
                    <TabsTrigger value="training">Training</TabsTrigger>
                  </TabsList>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <TabsContent value="general">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Model Name</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Enter model name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="equationType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Equation Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select equation type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="ODE">ODE (Ordinary Differential Equation)</SelectItem>
                                    <SelectItem value="PDE">PDE (Partial Differential Equation)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  ODEs are used for time evolution. PDEs are for spatial-temporal modeling.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Description of the model purpose and application"
                                    className="min-h-[80px]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="equation">
                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="equationFormula"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Equation Formula</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Enter equation (e.g., du/dt = a*u*(1-u/K) - b*u*v/(1+c*u))"
                                    className="min-h-[100px] font-mono"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Use standard mathematical notation. Variables: u,v,w,x,y,z,t. Parameters: a,b,c,d,K,r,etc.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          {form.watch("equationFormula") && (
                            <div className="p-4 border rounded-md bg-slate-50">
                              <p className="text-sm font-medium mb-2">Preview:</p>
                              <p className="text-lg font-medium" 
                                dangerouslySetInnerHTML={{ 
                                  __html: formatEquation(form.watch("equationFormula")) 
                                }}></p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Equation Parameters</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <FormItem>
                                  <FormLabel>a</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      value={form.watch("parameters.a") || 0.5}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          a: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>b</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      value={form.watch("parameters.b") || 0.2}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          b: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>c</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="0.01"
                                      value={form.watch("parameters.c") || 0.1}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          c: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>K</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      step="1"
                                      value={form.watch("parameters.K") || 100}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          K: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Common Models</h3>
                              <div className="space-y-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    form.setValue("equationFormula", "du/dt = a*u*(1-u/K) - b*u*v/(1+c*u)");
                                  }}
                                >
                                  Lotka-Volterra with saturation
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    form.setValue("equationFormula", "du/dt = a*u*(1-u/K)");
                                  }}
                                >
                                  Logistic Growth
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => {
                                    form.setValue("equationFormula", "d2u/dt2 + b*du/dt + k*u = F");
                                  }}
                                >
                                  Harmonic Oscillator
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="boundary">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Initial Conditions</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <FormItem>
                                  <FormLabel>u(0)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      value={form.watch("initialConditions.u") || 10}
                                      onChange={(e) => {
                                        const ics = form.getValues("initialConditions");
                                        form.setValue("initialConditions", {
                                          ...ics,
                                          u: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>v(0)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      value={form.watch("initialConditions.v") || 2}
                                      onChange={(e) => {
                                        const ics = form.getValues("initialConditions");
                                        form.setValue("initialConditions", {
                                          ...ics,
                                          v: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Domain Constraints</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <FormItem>
                                  <FormLabel>t range</FormLabel>
                                  <div className="flex space-x-2">
                                    <Input 
                                      type="number" 
                                      placeholder="Min"
                                      value={form.watch("domainConstraints.t")?.[0] || 0}
                                      onChange={(e) => {
                                        const domain = form.getValues("domainConstraints");
                                        const tRange = domain.t || [0, 100];
                                        form.setValue("domainConstraints", {
                                          ...domain,
                                          t: [parseFloat(e.target.value), tRange[1]]
                                        });
                                      }}
                                    />
                                    <Input 
                                      type="number" 
                                      placeholder="Max"
                                      value={form.watch("domainConstraints.t")?.[1] || 100}
                                      onChange={(e) => {
                                        const domain = form.getValues("domainConstraints");
                                        const tRange = domain.t || [0, 100];
                                        form.setValue("domainConstraints", {
                                          ...domain,
                                          t: [tRange[0], parseFloat(e.target.value)]
                                        });
                                      }}
                                    />
                                  </div>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>u range</FormLabel>
                                  <div className="flex space-x-2">
                                    <Input 
                                      type="number" 
                                      placeholder="Min"
                                      value={form.watch("domainConstraints.u")?.[0] || 0}
                                      onChange={(e) => {
                                        const domain = form.getValues("domainConstraints");
                                        const uRange = domain.u || [0, 100];
                                        form.setValue("domainConstraints", {
                                          ...domain,
                                          u: [parseFloat(e.target.value), uRange[1]]
                                        });
                                      }}
                                    />
                                    <Input 
                                      type="number" 
                                      placeholder="Max"
                                      value={form.watch("domainConstraints.u")?.[1] || 100}
                                      onChange={(e) => {
                                        const domain = form.getValues("domainConstraints");
                                        const uRange = domain.u || [0, 100];
                                        form.setValue("domainConstraints", {
                                          ...domain,
                                          u: [uRange[0], parseFloat(e.target.value)]
                                        });
                                      }}
                                    />
                                  </div>
                                </FormItem>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="training">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Training Parameters</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <FormItem>
                                  <FormLabel>Hidden Layers</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="1"
                                      max="10"
                                      value={form.watch("parameters.hiddenLayers") || 3}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          hiddenLayers: parseInt(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>Nodes per Layer</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="8"
                                      max="256"
                                      step="8"
                                      value={form.watch("parameters.nodesPerLayer") || 64}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          nodesPerLayer: parseInt(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>Epochs</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="100"
                                      max="10000"
                                      step="100"
                                      value={form.watch("parameters.epochs") || 1000}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          epochs: parseInt(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                                
                                <FormItem>
                                  <FormLabel>Learning Rate</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      min="0.0001"
                                      max="0.1"
                                      step="0.0001"
                                      value={form.watch("parameters.learningRate") || 0.001}
                                      onChange={(e) => {
                                        const params = form.getValues("parameters");
                                        form.setValue("parameters", {
                                          ...params,
                                          learningRate: parseFloat(e.target.value)
                                        });
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">Loss Weights</h3>
                              <div className="space-y-6">
                                <FormField
                                  control={form.control}
                                  name="physicsLossWeight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex justify-between">
                                        <FormLabel>Physics Loss Weight</FormLabel>
                                        <span className="text-sm">{field.value.toFixed(2)}</span>
                                      </div>
                                      <FormControl>
                                        <Slider 
                                          defaultValue={[field.value]} 
                                          max={1} 
                                          step={0.01}
                                          onValueChange={(vals) => field.onChange(vals[0])} 
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Weight of the physics-informed loss term
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="dataLossWeight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex justify-between">
                                        <FormLabel>Data Loss Weight</FormLabel>
                                        <span className="text-sm">{field.value.toFixed(2)}</span>
                                      </div>
                                      <FormControl>
                                        <Slider 
                                          defaultValue={[field.value]} 
                                          max={1} 
                                          step={0.01}
                                          onValueChange={(vals) => field.onChange(vals[0])} 
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Weight of the data-fitting loss term
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="boundaryLossWeight"
                                  render={({ field }) => (
                                    <FormItem>
                                      <div className="flex justify-between">
                                        <FormLabel>Boundary Loss Weight</FormLabel>
                                        <span className="text-sm">{field.value.toFixed(2)}</span>
                                      </div>
                                      <FormControl>
                                        <Slider 
                                          defaultValue={[field.value]} 
                                          max={1} 
                                          step={0.01}
                                          onValueChange={(vals) => field.onChange(vals[0])} 
                                        />
                                      </FormControl>
                                      <FormDescription>
                                        Weight of the boundary condition loss term
                                      </FormDescription>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <div className="flex justify-between pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (activeTab === "general") setActiveTab("equation");
                            else if (activeTab === "equation") setActiveTab("boundary");
                            else if (activeTab === "boundary") setActiveTab("training");
                          }}
                          disabled={activeTab === "training"}
                        >
                          Next
                        </Button>
                        
                        <div>
                          <Button
                            type="submit"
                            disabled={savePinnConfig.isPending}
                            className="ml-2"
                          >
                            {savePinnConfig.isPending ? "Saving..." : "Save Configuration"}
                          </Button>
                        </div>
                      </div>
                      
                      {isTraining && (
                        <div className="space-y-2 mt-4">
                          <div className="flex justify-between text-sm">
                            <span>Training Progress</span>
                            <span>{Math.round(trainingProgress)}%</span>
                          </div>
                          <Progress value={trainingProgress} />
                        </div>
                      )}
                    </form>
                  </Form>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trained PINN Models</CardTitle>
                <CardDescription>
                  View and manage your trained Physics-Informed Neural Network models
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modelsLoading ? (
                  <div className="text-center py-6">Loading models...</div>
                ) : pinnModels && pinnModels.length > 0 ? (
                  <div className="space-y-4">
                    {pinnModels.map((model) => (
                      <div key={model.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">{model.name}</h3>
                            <p className="text-sm text-gray-500">{model.description}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            model.trainingStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                            model.trainingStatus === 'training' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {model.trainingStatus}
                          </div>
                        </div>
                        
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>{" "}
                            <span className="font-medium">{model.equationType}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Accuracy:</span>{" "}
                            <span className="font-medium">{model.accuracy !== null ? `${model.accuracy.toFixed(2)}%` : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Physics Loss:</span>{" "}
                            <span className="font-medium">{model.physicsLoss !== null ? model.physicsLoss.toFixed(4) : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Created:</span>{" "}
                            <span className="font-medium">{new Date(model.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="outline" size="sm">Run Simulation</Button>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No PINN models found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure and train your first PINN model above
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}