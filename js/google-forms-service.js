// Google Forms Service for Food Dynasty
class GoogleFormsService {
    constructor() {
        // Default sheet name for Google Forms responses
        this.SHEET_NAME = 'Form Responses 1'; // Standard Google Forms response sheet name
        
        // Get configured spreadsheet ID, or show setup message if missing
        const SHEET_ID = '1VRjJ9oCmfRoG0SPKA0qGetjTM8osSj1ELzVdl_hUf9o'; // Google Forms response spreadsheet
        if (!SHEET_ID) {
            const setupError = new Error('Missing spreadsheet ID configuration.');
            console.error('[GFS] ⚠️ Spreadsheet ID not configured. Please follow setup steps:');
            console.error('1. Open your Google Form');
            console.error('2. Click Responses tab');
            console.error('3. Click "View in Sheets" or link icon');
            console.error('4. Copy ID from URL: docs.google.com/spreadsheets/d/[THIS-IS-THE-ID]/edit');
            console.error('5. Paste ID in google-forms-service.js constructor');
            console.error('Setup Guide: See AUTO-REPLY-SETUP-GUIDE.md for detailed instructions');
        }
        this.SPREADSHEET_ID = SHEET_ID;
    }

    async getFormSubmissions() {
        try {
            console.log('[GFS] getFormSubmissions: start');

            // Load gapi script if needed
            if (typeof gapi === 'undefined' || !gapi.client) {
                console.log('[GFS] Loading Google API script...');
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://apis.google.com/js/api.js';
                    script.onload = () => {
                        console.log('[GFS] Google API script loaded');
                        resolve();
                    };
                    script.onerror = (err) => {
                        console.error('[GFS] Failed to load Google API script', err);
                        reject(new Error('Failed to load Google API'));
                    };
                    document.body.appendChild(script);
                });
            } else {
                console.log('[GFS] gapi already present');
            }

            // Try to initialize gapi client
            try {
                console.log('[GFS] Initializing gapi.client...');
                // add timeout to avoid hanging forever if gapi init stalls
                await new Promise((resolve, reject) => {
                    let finished = false;
                    const timer = setTimeout(() => {
                        if (!finished) {
                            const err = new Error('gapi.client.init timeout after 8s');
                            console.error('[GFS] ', err.message);
                            reject(err);
                        }
                    }, 8000);

                    try {
                        gapi.load('client', async () => {
                            try {
                                // Skip gapi initialization for local development
                if (window.location.protocol === 'file:') {
                    console.log('[GFS] Skipping gapi init for local file system');
                    throw new Error('Local development - skipping gapi');
                }
                await gapi.client.init({
                    apiKey: 'AIzaSyB2xOKhNnhRZmyskbbpHHzmZ4l5WcneQ2A',
                    discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                });
                                finished = true;
                                clearTimeout(timer);
                                console.log('[GFS] gapi.client initialized');
                                resolve();
                            } catch (err) {
                                finished = true;
                                clearTimeout(timer);
                                console.error('[GFS] gapi.client.init error', err);
                                reject(err);
                            }
                        });
                    } catch (loadErr) {
                        finished = true;
                        clearTimeout(timer);
                        console.error('[GFS] gapi.load threw', loadErr);
                        reject(loadErr);
                    }
                });

                // Make the API request via gapi
                console.log('[GFS] Requesting sheet values via gapi...');
                console.log(`[GFS] Sheet name: ${this.SHEET_NAME}`);
                console.log(`[GFS] Range: ${this.SHEET_NAME}!A2:G`);
                const response = await gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: this.SPREADSHEET_ID,
                    range: `${this.SHEET_NAME}!A2:G`
                });

                if (response.result && response.result.values) {
                    console.log('[GFS] gapi returned rows:', response.result.values.length);
                    return response.result.values.map(row => ({
                        timestamp: row[0] || '',
                        name: row[1] || '',
                        email: row[2] || '',
                        phone: row[3] || '',
                        purpose: row[4] || '',
                        subject: row[5] || '',
                        message: row[6] || ''
                    })).reverse(); // Most recent first
                }
            } catch (gapiError) {
                console.warn('[GFS] gapi path failed, falling back to REST fetch:', gapiError && gapiError.message);
            }

            // Fallback: REST fetch to Sheets API using API key
            try {
                console.log('[GFS] Attempting REST fetch fallback...');
                // First, try to get sheet metadata to verify sheet name
                const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}?key=AIzaSyB2xOKhNnhRZmyskbbpHHzmZ4l5WcneQ2A`;
                const metadataRes = await fetch(metadataUrl);
                if (metadataRes.ok) {
                    const metadata = await metadataRes.json();
                    console.log('[GFS] Available sheets:', metadata.sheets.map(s => s.properties.title));
                    // Update sheet name if we find a form responses sheet
                    const formSheet = metadata.sheets.find(s => s.properties.title.includes('Form Responses'));
                    if (formSheet) {
                        this.SHEET_NAME = formSheet.properties.title;
                        console.log('[GFS] Updated sheet name to:', this.SHEET_NAME);
                    }
                }

                const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/${encodeURIComponent(this.SHEET_NAME)}!A2:G?key=AIzaSyB2xOKhNnhRZmyskbbpHHzmZ4l5WcneQ2A`;
                console.log('[GFS] Fetching from URL:', url);
                const res = await fetch(url);
                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    throw new Error(`REST fetch failed: ${res.status} ${res.statusText} ${text}`);
                }
                const data = await res.json();
                console.log('[GFS] REST fetch returned rows:', (data.values || []).length);
                if (data.values) {
                    return data.values.map(row => ({
                        timestamp: row[0] || '',
                        name: row[1] || '',
                        email: row[2] || '',
                        phone: row[3] || '',
                        purpose: row[4] || '',
                        subject: row[5] || '',
                        message: row[6] || ''
                    })).reverse();
                }
            } catch (restError) {
                console.error('[GFS] REST fallback failed:', restError);
            }

            return [];
        } catch (error) {
            console.error('Error fetching form submissions:', error);
            // For debugging
            if (error.result && error.result.error) {
                console.error('API Error details:', error.result.error);
            }
            return [];
        }
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
}

// Export for global use
window.GoogleFormsService = GoogleFormsService;