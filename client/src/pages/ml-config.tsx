import { useState } from "react";
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
import { MlModel } from "@shared/schema";
import { MlConfig as MlConfigType } from "@shared/types";

const mlConfigSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  modelType: z.enum(["pinn", "uode", "neural_ode", "hybrid"]),
  parameters: z.record(z.any()),
});

export default function MlConfig() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const { toast } = useToast();

  // Fetch ML models
  const { data: mlModels, isLoading: modelsLoading } = useQuery<MlModel[]>({
    queryKey: ['/api/ml/models'],
  });

  // Fetch current ML configuration
  const { data: mlConfig, isLoading: configLoading } = useQuery<MlConfigType>({
    queryKey: ['/api/ml/config'],
  });

  const form = useForm<z.infer<typeof mlConfigSchema>>({
    resolver: zodResolver(mlConfigSchema),
    defaultValues: {
      name: "",
      description: "",
      modelType: "pinn",
      parameters: {
        learningRate: 0.001,
        hiddenLayers: 3,
        nodesPerLayer: 64,
        activationFunction: "tanh",
        epochs: 1000,
        batchSize: 32,
      },
    },
  });

  // Update form values when data is loaded
  useState(() => {
    if (mlConfig) {
      form.reset({
        name: mlModels?.[0]?.name || "Default Model",
        description: mlModels?.[0]?.description || "",
        modelType: mlConfig.modelType as any,
        parameters: mlConfig.parameters,
      });
    }
  });

  // Save ML configuration
  const saveMlConfig = useMutation({
    mutationFn: async (data: z.infer<typeof mlConfigSchema>) => {
      const res = await apiRequest('POST', '/api/ml/config', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml/config'] });
      toast({
        title: "Success",
        description: "ML configuration saved successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save ML configuration",
        variant: "destructive",
      });
    },
  });

  // Train ML model
  const trainModel = useMutation({
    mutationFn: async (data: z.infer<typeof mlConfigSchema>) => {
      const res = await apiRequest('POST', '/api/ml/train', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ml/models'] });
      toast({
        title: "Success",
        description: "Model training completed successfully",
      });
      setIsTraining(false);
      setTrainingProgress(100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to train model",
        variant: "destructive",
      });
      setIsTraining(false);
    },
  });

  const onSubmit = (values: z.infer<typeof mlConfigSchema>) => {
    saveMlConfig.mutate(values);
  };

  const handleTrainModel = () => {
    const values = form.getValues();
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate progress updates
    const interval = setInterval(() => {
      setTrainingProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 1000);
    
    trainModel.mutate(values);
  };

  const getModelDescription = (modelType: string) => {
    switch (modelType) {
      case "pinn":
        return "Physics-Informed Neural Networks combine neural networks with physical laws encoded as differential equations.";
      case "uode":
        return "Universal Ordinary Differential Equations discover governing equations from data by combining neural networks with differential equations.";
      case "neural_ode":
        return "Neural ODEs parameterize the derivative of the hidden state using a neural network for continuous-depth models.";
      case "hybrid":
        return "Hybrid models combine multiple SciML approaches to balance physical knowledge and data-driven learning.";
      default:
        return "";
    }
  };

  const renderParametersForm = () => {
    const modelType = form.watch("modelType");
    
    switch (modelType) {
      case "pinn":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="parameters.learningRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          max="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Step size for gradient descent (0.0001-0.1)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.hiddenLayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hidden Layers</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of hidden layers (1-10)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.nodesPerLayer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nodes Per Layer</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="8"
                          min="8"
                          max="256"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of nodes per hidden layer (8-256)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="parameters.activationFunction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activation Function</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activation function" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tanh">Tanh</SelectItem>
                          <SelectItem value="relu">ReLU</SelectItem>
                          <SelectItem value="sigmoid">Sigmoid</SelectItem>
                          <SelectItem value="swish">Swish</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Activation function for neural network layers
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.epochs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Epochs</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          min="100"
                          max="10000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of training epochs (100-10000)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.batchSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Size</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="8"
                          min="8"
                          max="256"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Batch size for training (8-256)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="parameters.physicsDomainKnowledge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physics Domain Knowledge</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter physics constraints and domain knowledge for the model"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Define domain-specific constraints for dependency modeling (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
          </>
        );
      
      case "uode":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="parameters.learningRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Learning Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.0001"
                          min="0.0001"
                          max="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.uodeComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Complexity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "medium"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select complexity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Controls the complexity of discovered equations
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.regularization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regularization</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Regularization strength (0-1)
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="parameters.differentialEquationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Differential Equation Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "ode"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equation type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ode">ODE</SelectItem>
                          <SelectItem value="sde">SDE</SelectItem>
                          <SelectItem value="dde">DDE</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Type of differential equation to discover
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.maxTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Terms</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          max="20"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of terms in discovered equations
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parameters.epochs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Epochs</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100"
                          min="100"
                          max="10000"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        );
      
      case "neural_ode":
      case "hybrid":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="parameters.learningRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Learning Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        min="0.0001"
                        max="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parameters.epochs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Epochs</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="100"
                        min="100"
                        max="10000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parameters.advancedConfiguration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advanced Configuration (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter advanced configuration in JSON format"
                      className="min-h-[150px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Advanced model parameters in JSON format (for experienced users)
                  </FormDescription>
                </FormItem>
              )}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="ML Configuration" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background mt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scientific Machine Learning Configuration</CardTitle>
                <CardDescription>
                  Configure and train the Physics-Informed Neural Networks (PINNs) and Scientific ML models
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        name="modelType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select model type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pinn">Physics-Informed Neural Network (PINN)</SelectItem>
                                <SelectItem value="uode">Universal Differential Equations (UDE)</SelectItem>
                                <SelectItem value="neural_ode">Neural ODE</SelectItem>
                                <SelectItem value="hybrid">Hybrid Model</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {getModelDescription(form.watch("modelType"))}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Enter model description"
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Model Parameters</h3>
                      {renderParametersForm()}
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTrainModel}
                        disabled={isTraining || saveMlConfig.isPending}
                      >
                        {isTraining ? "Training..." : "Train Model"}
                      </Button>
                      <Button
                        type="submit"
                        disabled={isTraining || saveMlConfig.isPending}
                      >
                        {saveMlConfig.isPending ? "Saving..." : "Save Configuration"}
                      </Button>
                    </div>
                    
                    {isTraining && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Training Progress</span>
                          <span>{trainingProgress}%</span>
                        </div>
                        <Progress value={trainingProgress} />
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trained Models</CardTitle>
                <CardDescription>
                  View and manage your trained Scientific ML models
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modelsLoading ? (
                  <div className="text-center py-6">Loading models...</div>
                ) : mlModels && mlModels.length > 0 ? (
                  <div className="space-y-4">
                    {mlModels.map((model) => (
                      <div key={model.id} className="border rounded-md p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{model.name}</h3>
                          <p className="text-sm text-gray-500">
                            {model.description || "No description provided"}
                          </p>
                          <div className="flex mt-2 text-xs text-gray-500 space-x-4">
                            <span>Type: {model.modelType}</span>
                            {model.accuracy && <span>Accuracy: {model.accuracy}%</span>}
                            <span>Status: {model.trainingStatus}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">download</span>
                            Export
                          </Button>
                          <Button variant="outline" size="sm">
                            <span className="material-icons text-sm mr-1">delete</span>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No trained models available. Configure and train a model above.
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
