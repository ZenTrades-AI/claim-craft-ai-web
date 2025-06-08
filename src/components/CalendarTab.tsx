import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, CalendarCheck, CalendarClock, Calendar as CalendarIcon, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CalendarTabProps {
  initialCalls?: any[];
  initialLoading?: boolean;
  dataLoaded?: boolean;
  refreshCalls?: () => Promise<void>;
  updateCall?: (updatedCall: any) => void;
}

const CalendarTab = ({
  initialCalls = [],
  initialLoading = false,
  dataLoaded = false,
  refreshCalls,
}: CalendarTabProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const { agentId } = useAuth();

  // Get all appointments to display as events
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      
      if (!agentId) {
        toast.error("No agent ID found");
        setIsLoading(false);
        return;
      }
      
      // Fetch all calls that have appointment data
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('agent_id', agentId)
        .not('appointment_date', 'is', null);
      
      if (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load calendar events");
        setIsLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Convert to events for the calendar
        const eventsData = data.map(appointment => ({
          id: appointment.id || appointment.call_id,
          title: `Call ${appointment.call_id?.substring(0, 8)}`,
          date: appointment.appointment_date,
          time: appointment.appointment_time || "00:00",
          status: appointment.appointment_status || "scheduled"
        }));
        
        setEvents(eventsData);
        console.log("Loaded calendar events:", eventsData);
      } else {
        console.log("No calendar events found");
        setEvents([]);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      toast.error("Failed to load calendar events");
      setIsLoading(false);
    }
  };

  // Process calls data to extract only scheduled appointments as events
  useEffect(() => {
    if (initialCalls && initialCalls.length > 0) {
      const appointmentsData = initialCalls.filter(call => call.appointment_date);
      
      // Convert to events for the calendar
      const eventsData = appointmentsData.map(appointment => ({
        id: appointment.id || appointment.call_id,
        title: `Call ${appointment.call_id?.substring(0, 8)}`,
        date: appointment.appointment_date,
        time: appointment.appointment_time || "00:00",
        status: appointment.appointment_status || "scheduled"
      }));
      
      setEvents(eventsData);
      setIsLoading(false);
    } else if (dataLoaded) {
      // If no initial calls but data is loaded, fetch directly
      fetchAppointments();
    } else {
      setIsLoading(initialLoading);
    }
  }, [initialCalls, initialLoading, dataLoaded]);

  // Filter events for the selected date
  const getEventsForDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return [];
    
    const dateString = selectedDate.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const connectGoogleCalendar = () => {
    setShowComingSoonDialog(true);
  };

  const selectedDateEvents = getEventsForDate(date);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendar Integration
          </CardTitle>
          <CardDescription>
            View and manage your appointments in calendar view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="month" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger 
                value="month" 
                onClick={() => setShowComingSoonDialog(true)}
              >
                Month View
              </TabsTrigger>
              <TabsTrigger 
                value="day"
                onClick={() => setShowComingSoonDialog(true)}
              >
                Day View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="month" className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-md">
                <CalendarCheck className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Calendar Integration Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  We're working on bringing you a comprehensive calendar view with Google Calendar sync, 
                  advanced scheduling features, and seamless appointment management.
                </p>
                <Button 
                  onClick={() => setShowComingSoonDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Learn More
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="day" className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-md">
                <Clock className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Day View Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  Enhanced day view with time slots, drag-and-drop scheduling, 
                  and real-time updates is under development.
                </p>
                <Button 
                  onClick={() => setShowComingSoonDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Get Notified
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            {events.length} total appointments in your system
          </div>
          <Button 
            onClick={connectGoogleCalendar}
            variant="outline"
            className="border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            Connect Google Calendar
          </Button>
        </CardFooter>
      </Card>

      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Calendar Integration Coming Soon! 🚀
            </DialogTitle>
            <DialogDescription className="text-base mt-3">
              We're building an amazing calendar experience that will include:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-6">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Google Calendar Sync</p>
                <p className="text-xs text-gray-600">Two-way sync with your existing calendar</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Smart Scheduling</p>
                <p className="text-xs text-gray-600">AI-powered appointment suggestions and conflict detection</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Team Collaboration</p>
                <p className="text-xs text-gray-600">Share calendars and coordinate with your team</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-sm">Advanced Views</p>
                <p className="text-xs text-gray-600">Day, week, month views with customizable layouts</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShowComingSoonDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                toast.success("Thanks for your interest! We'll notify you when it's ready.");
                setShowComingSoonDialog(false);
              }}
            >
              Get Notified
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarTab;
