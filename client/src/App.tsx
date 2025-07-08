import { useState, useRef } from 'react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event:any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h2>🎙️ Voice to Text App</h2>
      <button onClick={isRecording ? stopRecognition : startRecognition}>
        {isRecording ? 'Stop' : 'Start'} Recording
      </button>
      <div style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
        <strong>Transcribed Text:</strong>
        <p>{transcript || 'No speech detected yet...'}</p>
      </div>
    </div>
  );
}

export default App;
