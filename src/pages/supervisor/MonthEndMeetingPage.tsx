import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupervisorMeeting } from '@/hooks/useSupervisorMeeting';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Users, Calendar,
  AlertCircle, Maximize2, Minimize2, User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, lastDayOfMonth, isToday } from 'date-fns';

export default function MonthEndMeetingPage() {
  const { user } = useAuth();
  const meeting = useSupervisorMeeting(user?.id || '');

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [focusedPeerId, setFocusedPeerId] = useState<string | null>(null);

  const supervisorVideoRef = useRef<HTMLVideoElement>(null);
  const mentorVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const today = new Date();
  const lastDay = lastDayOfMonth(today);
  const isMeetingDay = isToday(lastDay);

  // Attach supervisor stream
  useEffect(() => {
    if (supervisorVideoRef.current && meeting.localStream) {
      supervisorVideoRef.current.srcObject = meeting.localStream;
    }
  }, [meeting.localStream]);

  // Attach mentor streams
  useEffect(() => {
    meeting.participants.forEach((p, peerId) => {
      const el = mentorVideoRefs.current.get(peerId);
      if (el && p.stream && el.srcObject !== p.stream) {
        el.srcObject = p.stream;
      }
    });
  }, [meeting.participants]);

  const toggleCamera = () => {
    if (meeting.localStream) {
      meeting.localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCameraOn(!cameraOn);
    }
  };

  const toggleMic = () => {
    if (meeting.localStream) {
      meeting.localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(!micOn);
    }
  };

  const participantList = useMemo(() => Array.from(meeting.participants.entries()), [meeting.participants]);

  // Determine what's in the main view
  const focusedParticipant = focusedPeerId ? meeting.participants.get(focusedPeerId) : null;

  // Small cards = all mentors (if none focused) or mentors + supervisor swap
  const setMentorRef = (peerId: string) => (el: HTMLVideoElement | null) => {
    if (el) mentorVideoRefs.current.set(peerId, el);
    else mentorVideoRefs.current.delete(peerId);
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-3 -mt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Month End Meeting</h1>
          <p className="text-xs text-muted-foreground">Monthly supervisor meeting with mentors</p>
        </div>
        <div className="flex items-center gap-2">
          {meeting.isMeetingStarted && (
            <>
              <Badge variant="outline" className={cn("gap-1", meeting.isAuthenticated ? "border-green-500/50 text-green-400" : "border-yellow-500/50 text-yellow-400")}>
                <span className={cn("w-1.5 h-1.5 rounded-full", meeting.isAuthenticated ? "bg-green-500" : "bg-yellow-500")} />
                {meeting.connectionStatus}
              </Badge>
              <Badge variant="outline" className="gap-1 border-primary/50 text-primary">
                <Users className="h-3 w-3" /> {participantList.length} mentor(s)
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 grid grid-cols-[1fr_300px] gap-3 min-h-0">
        {/* LEFT: Video area */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Main video */}
          <Card className="flex-1 flex flex-col overflow-hidden relative">
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="text-[10px] gap-1">
                <User className="h-3 w-3" />
                {focusedParticipant ? `Mentor` : 'You (Supervisor)'}
              </Badge>
            </div>
            {focusedParticipant && (
              <div className="absolute top-2 right-2 z-10">
                <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/60 backdrop-blur-sm"
                  onClick={() => setFocusedPeerId(null)}>
                  <Minimize2 className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              {focusedParticipant?.stream ? (
                <video
                  ref={setMentorRef(`main-${focusedPeerId}`)}
                  autoPlay playsInline
                  className="w-full h-full object-contain"
                />
              ) : meeting.localStream ? (
                <video
                  ref={supervisorVideoRef}
                  autoPlay playsInline muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Video className="h-16 w-16 opacity-30" />
                  <p className="text-sm">{meeting.isMeetingStarted ? 'Camera starting...' : 'Start meeting to begin'}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Mentor grid */}
          {participantList.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {/* If a mentor is focused, show supervisor as small card */}
              {focusedPeerId && meeting.localStream && (
                <Card
                  className="w-40 h-28 flex-shrink-0 overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => setFocusedPeerId(null)}
                >
                  <div className="absolute top-1 left-1 z-10">
                    <Badge variant="secondary" className="text-[8px] gap-0.5 px-1 py-0">
                      <User className="h-2 w-2" /> You
                    </Badge>
                  </div>
                  <video
                    autoPlay playsInline muted
                    ref={el => { if (el && meeting.localStream) el.srcObject = meeting.localStream; }}
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </Card>
              )}
              {participantList.map(([peerId, p]) => {
                if (peerId === focusedPeerId) return null;
                return (
                  <Card
                    key={peerId}
                    className="w-40 h-28 flex-shrink-0 overflow-hidden relative cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => setFocusedPeerId(peerId)}
                  >
                    <div className="absolute top-1 left-1 z-10">
                      <Badge variant="secondary" className="text-[8px] gap-0.5 px-1 py-0">
                        <User className="h-2 w-2" /> Mentor
                      </Badge>
                    </div>
                    <div className="absolute top-1 right-1 z-10">
                      <Button variant="ghost" size="icon" className="h-5 w-5 bg-background/60"
                        onClick={(e) => { e.stopPropagation(); setFocusedPeerId(peerId); }}>
                        <Maximize2 className="h-2 w-2" />
                      </Button>
                    </div>
                    {p.stream ? (
                      <video
                        ref={setMentorRef(peerId)}
                        autoPlay playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted/50">
                        <User className="h-6 w-6 text-muted-foreground opacity-40" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Controls */}
          {meeting.isMeetingStarted && (
            <div className="flex items-center justify-center gap-3 py-2">
              <Button variant={cameraOn ? 'outline' : 'destructive'} size="icon" onClick={toggleCamera} className="h-12 w-12 rounded-full">
                {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              <Button variant={micOn ? 'outline' : 'destructive'} size="icon" onClick={toggleMic} className="h-12 w-12 rounded-full">
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              <Button variant="destructive" size="icon" onClick={meeting.endMeeting} className="h-12 w-12 rounded-full">
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT: Meeting Info */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" /> Meeting Info
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 text-sm">
            <div className="space-y-3">
              <InfoRow label="Title" value="Month End Meeting" />
              <InfoRow label="Description" value="Monthly supervisor meeting with mentors for addressing issues, reviewing progress, and communication." />
              <InfoRow label="Date" value={format(today, 'MMMM d, yyyy')} />
              <InfoRow label="Meeting Day" value={format(lastDay, 'MMMM d, yyyy')} />
              <InfoRow label="Status" value={
                <Badge variant={meeting.isMeetingStarted ? 'default' : 'secondary'} className="text-[10px]">
                  {meeting.isMeetingStarted ? 'In Progress' : isMeetingDay ? 'Ready' : 'Scheduled'}
                </Badge>
              } />
              <InfoRow label="Participants" value={`${participantList.length} mentor(s)`} />
            </div>

            {meeting.error && (
              <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {meeting.error}
              </div>
            )}

            {!isMeetingDay && !meeting.isMeetingStarted && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Not Available Today</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Month End Meeting will be available on the last day of the month ({format(lastDay, 'MMMM d')}).
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto pt-4">
              {!meeting.isMeetingStarted ? (
                <Button className="w-full" disabled={!isMeetingDay} onClick={meeting.startMeeting}>
                  <Video className="h-4 w-4 mr-2" /> Start Meeting
                </Button>
              ) : (
                <Button variant="destructive" className="w-full" onClick={meeting.endMeeting}>
                  <PhoneOff className="h-4 w-4 mr-2" /> End Meeting
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="text-foreground text-xs">{value}</div>
    </div>
  );
}
