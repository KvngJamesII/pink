import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Home from "@/pages/home";
import TaskDetail from "@/pages/task-detail";
import Review from "@/pages/review";
import CreateTask from "@/pages/create-task";
import Wallet from "@/pages/wallet";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/" component={Home} />
        <Route path="/task/:id" component={TaskDetail} />
        <Route path="/review/:id" component={Review} />
        <Route path="/create-task" component={CreateTask} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/profile" component={Profile} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
