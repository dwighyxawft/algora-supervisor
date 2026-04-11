import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { usePeerConnection } from '@/hooks/usePeerConnection';
import { useMediaStreams } from '@/hooks/useMediaStreams';
import { codeInterviewService } from '@/lib/api/services';
import type { CodeInterview } from '@/lib/api/models';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor,
  Maximize2, Minimize2, Clock, User, AlertCircle, Loader2, ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInSeconds, isPast } from 'date-fns';

export default function CodeInterviewRoomPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interview, setInterview] = useState<CodeInterview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [canJoin, setCanJoin] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [expandedVideo, setExpandedVideo] = useState<'mentor-cam' | 'supervisor-cam' | 'screen' | null>(null);

  const mentorCamRef = useRef<HTMLVideoElement>(null);
  const mentorScreenRef = useRef<HTMLVideoElement>(null);
  const supervisorCamRef = useRef<HTMLVideoElement>(null);

  const { stream: localStream, startCamera, stopCamera, error: mediaError } = useMediaStreams();

  const socket = useSocketConnection({
    userId: user?.id || '',
    userType: 'supervisor',
    roomId: interviewId || '',
  });

  const peer = usePeerConnection(localStream);

  // Fetch interview
  useEffect(() => {
    if (!interviewId) return;
    codeInterviewService.findOne(interviewId)
      .then(data => { setInterview(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [interviewId]);

  // Countdown & time-gating (join only between start and end)
  useEffect(() => {
    if (!interview?.startDateTime) { setCanJoin(true); return; }
    const tick = () => {
      const start = new Date(interview.startDateTime!);
      const end = interview.endDateTime ? new Date(interview.endDateTime) : null;
      const now = new Date();

      // If end time has passed, cannot join
      if (end && isPast(end)) { setCanJoin(false); setCountdown('Interview has ended'); return; }

      if (isPast(start)) { setCanJoin(true); setCountdown(''); return; }
      const diff = differenceInSeconds(start, now);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setCountdown(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      setCanJoin(false);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [interview]);

  // Attach local stream
  useEffect(() => {
    if (supervisorCamRef.current && localStream) {
      supervisorCamRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote streams
  useEffect(() => {
    if (mentorCamRef.current && peer.remoteStreams.mentorCamera) {
      mentorCamRef.current.srcObject = peer.remoteStreams.mentorCamera;
    }
  }, [peer.remoteStreams.mentorCamera]);

  useEffect(() => {
    if (mentorScreenRef.current && peer.remoteStreams.mentorScreen) {
      mentorScreenRef.current.srcObject = peer.remoteStreams.mentorScreen;
    }
  }, [peer.remoteStreams.mentorScreen]);

  // Share peerId once ready
  useEffect(() => {
    if (peer.peerId && joined) {
      socket.sharePeerId(peer.peerId);
    }
  }, [peer.peerId, joined, socket.sharePeerId]);

  // SCENARIO 2: When we receive mentor's peerId, call them
  useEffect(() => {
    if (socket.remotePeerId && peer.isReady) {
      peer.callPeer(socket.remotePeerId);
    }
  }, [socket.remotePeerId, peer.isReady, peer.callPeer]);

  const handleJoinRoom = useCallback(async () => {
    await startCamera();
    socket.connect();
    peer.createPeer();
    setJoined(true);
  }, [startCamera, socket, peer]);

  const handleLeaveRoom = useCallback(() => {
    socket.disconnect();
    peer.destroyPeer();
    stopCamera();
    setJoined(false);
  }, [socket, peer, stopCamera]);

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setCameraOn(!cameraOn);
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setMicOn(!micOn);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Interview not found</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  const mentorName = interview.mentor
    ? `${interview.mentor.firstName} ${interview.mentor.lastName}`
    : 'Mentor';
  const mentorInitials = interview.mentor
    ? `${interview.mentor.firstName?.[0] || ''}${interview.mentor.lastName?.[0] || ''}`.toUpperCase()
    : 'MT';

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-3 -mt-2">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {joined && (
            <>
              <Badge variant="outline" className={cn("gap-1", socket.isAuthenticated ? "border-green-500/50 text-green-400" : "border-yellow-500/50 text-yellow-400")}>
                <span className={cn("w-1.5 h-1.5 rounded-full", socket.isAuthenticated ? "bg-green-500" : "bg-yellow-500")} />
                {socket.connectionStatus}
              </Badge>
              {socket.mentorJoined && (
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Mentor Online</Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main 3-panel layout */}
      <div className="flex-1 grid grid-cols-[280px_1fr_280px] gap-3 min-h-0">
        {/* LEFT — Interview Details */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-3 space-y-1">
            <CardTitle className="text-base">Interview Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={interview.mentor?.image} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">{mentorInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{mentorName}</p>
                <p className="text-xs text-muted-foreground">{interview.mentor?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Title" value={interview.title} />
              <DetailRow label="Status" value={
                <Badge variant={interview.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px]">
                  {interview.status}
                </Badge>
              } />
              {interview.startDateTime && (
                <DetailRow label="Scheduled" value={format(new Date(interview.startDateTime), 'MMM d, yyyy h:mm a')} />
              )}
              {interview.durationMinutes && (
                <DetailRow label="Duration" value={`${interview.durationMinutes} min`} />
              )}
              <DetailRow label="Pass Cutoff" value={`${interview.passCutoff}%`} />
              {interview.score != null && (
                <DetailRow label="Score" value={`${interview.score}%`} />
              )}
            </div>

            {interview.tasks && interview.tasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</p>
                {interview.tasks.map((task, i) => (
                  <div key={task.id} className="p-2 rounded-md bg-muted/50 text-xs">
                    <p className="font-medium text-foreground">Task {i + 1} ({task.points} pts)</p>
                    {task.requirements?.map((r, ri) => (
                      <p key={ri} className="text-muted-foreground mt-0.5">• {r}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {(socket.error || peer.error || mediaError) && (
              <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                {socket.error || peer.error || mediaError}
              </div>
            )}

            <div className="mt-auto pt-4">
              {!joined ? (
                <>
                  {!canJoin && countdown && countdown !== 'Interview has ended' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 mb-3">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Starts in</p>
                        <p className="text-lg font-mono font-bold text-foreground">{countdown}</p>
                      </div>
                    </div>
                  )}
                  {countdown === 'Interview has ended' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 mb-3">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive font-medium">Interview has ended</p>
                    </div>
                  )}
                  <Button className="w-full" disabled={!canJoin} onClick={handleJoinRoom}>
                    <Video className="h-4 w-4 mr-2" /> Join Interview Room
                  </Button>
                </>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Button variant={cameraOn ? 'outline' : 'destructive'} size="icon" onClick={toggleCamera}>
                    {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button variant={micOn ? 'outline' : 'destructive'} size="icon" onClick={toggleMic}>
                    {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button variant="destructive" size="icon" onClick={handleLeaveRoom}>
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CENTER — Screen Share */}
        <Card className={cn(
          "flex flex-col overflow-hidden relative",
          expandedVideo === 'screen' && "fixed inset-4 z-50"
        )}>
          <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/60 backdrop-blur-sm"
              onClick={() => setExpandedVideo(expandedVideo === 'screen' ? null : 'screen')}>
              {expandedVideo === 'screen' ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-muted/30 relative">
            {peer.remoteStreams.mentorScreen ? (
              <video ref={mentorScreenRef} autoPlay playsInline className="w-full h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Monitor className="h-16 w-16 opacity-30" />
                <p className="text-sm">Waiting for mentor screen share...</p>
                {joined && !socket.mentorJoined && <p className="text-xs">Mentor has not joined yet</p>}
              </div>
            )}
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Monitor className="h-3 w-3" /> Screen Share
              </Badge>
            </div>
          </div>
        </Card>

        {/* RIGHT — Camera Feeds */}
        <div className="flex flex-col gap-3 min-h-0">
          {/* Mentor Camera */}
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden relative cursor-pointer",
            expandedVideo === 'mentor-cam' && "fixed inset-4 z-50"
          )} onClick={() => setExpandedVideo(expandedVideo === 'mentor-cam' ? null : 'mentor-cam')}>
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="text-[10px] gap-1"><User className="h-3 w-3" /> {mentorName}</Badge>
            </div>
            <div className="absolute top-2 right-2 z-10">
              <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/60 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); setExpandedVideo(expandedVideo === 'mentor-cam' ? null : 'mentor-cam'); }}>
                {expandedVideo === 'mentor-cam' ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              {peer.remoteStreams.mentorCamera ? (
                <video ref={mentorCamRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <User className="h-10 w-10 opacity-30" />
                  <p className="text-[11px]">Mentor camera</p>
                </div>
              )}
            </div>
          </Card>

          {/* Supervisor Camera */}
          <Card className={cn(
            "flex-1 flex flex-col overflow-hidden relative cursor-pointer",
            expandedVideo === 'supervisor-cam' && "fixed inset-4 z-50"
          )} onClick={() => setExpandedVideo(expandedVideo === 'supervisor-cam' ? null : 'supervisor-cam')}>
            <div className="absolute top-2 left-2 z-10">
              <Badge variant="secondary" className="text-[10px] gap-1"><User className="h-3 w-3" /> You</Badge>
            </div>
            <div className="absolute top-2 right-2 z-10">
              <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/60 backdrop-blur-sm"
                onClick={(e) => { e.stopPropagation(); setExpandedVideo(expandedVideo === 'supervisor-cam' ? null : 'supervisor-cam'); }}>
                {expandedVideo === 'supervisor-cam' ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-muted/30">
              {localStream ? (
                <video ref={supervisorCamRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <VideoOff className="h-10 w-10 opacity-30" />
                  <p className="text-[11px]">{joined ? 'Camera starting...' : 'Camera off'}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}
