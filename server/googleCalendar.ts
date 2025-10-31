import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings?.settings?.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

export async function getGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface CalendarEvent {
  sessionId: string;
  mentorEmail: string;
  learnerEmail: string;
  mentorName: string;
  learnerName: string;
  skillTopic: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  message?: string;
}

export async function createCalendarEventWithMeet(event: CalendarEvent): Promise<{ eventId: string; meetLink: string }> {
  try {
    const calendar = await getGoogleCalendarClient();
    
    const [hours, minutes] = event.sessionTime.split(':');
    const [year, month, day] = event.sessionDate.split('-');
    
    const startDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    
    const endDateTime = new Date(startDateTime.getTime() + event.duration * 60000);

    const calendarEvent = {
      summary: `Skill Swap: ${event.skillTopic}`,
      description: `Skill Swap Session\n\nMentor: ${event.mentorName}\nLearner: ${event.learnerName}\nSkill: ${event.skillTopic}\nDuration: ${event.duration} minutes\n\n${event.message ? `Message: ${event.message}\n\n` : ''}Session ID: ${event.sessionId}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: event.mentorEmail },
        { email: event.learnerEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: event.sessionId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: calendarEvent,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || response.data.hangoutLink;
    
    if (!meetLink) {
      throw new Error('Failed to generate Google Meet link');
    }

    return {
      eventId: response.data.id!,
      meetLink,
    };
  } catch (error) {
    console.error('Google Calendar API error:', error);
    throw error;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    const calendar = await getGoogleCalendarClient();
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all',
    });
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
  }
}
