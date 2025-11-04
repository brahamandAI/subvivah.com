import React, { useState } from 'react';

export default function VoiceInterviewWithAI() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [lang, setLang] = useState('en-IN');

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Your browser does not support Speech Recognition. Please use Chrome or Edge.');
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      console.log('Speech recognized:', spokenText);
      setTranscript(spokenText);
      sendToAI(spokenText);
    };
    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
      alert('Error with speech recognition. Please try again.');
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
    setIsListening(true);
  };

  const sendToAI = async (text) => {
    console.log('Sending to AI:', text);
    setResponse('Processing...');
    try {
      const res = await fetch('/api/ai-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      console.log('AI response:', data);
      setResponse(data.reply);
      speak(data.reply);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      setResponse('Error getting response from AI.');
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">🎙️ AI Voice Interview</h2>
      <select onChange={(e) => setLang(e.target.value)} value={lang} className="mb-4">
        <option value="en-IN">English</option>
        <option value="hi-IN">Hindi</option>
        <option value="ta-IN">Tamil</option>
        <option value="bn-IN">Bengali</option>
        <option value="te-IN">Telugu</option>
        <option value="gu-IN">Gujarati</option>
        {/* Add more as needed */}
      </select>
      <button
        onClick={startRecognition}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
      >
        {isListening ? 'Listening...' : 'Start Interview'}
      </button>
      <div className="mt-4">
        <p><strong>You said:</strong> {transcript}</p>
        <p><strong>AI says:</strong> {response}</p>
      </div>
    </div>
  );
} 