import { useState, useEffect } from 'react';
import './Loader.css';

const LOG_THRESHOLDS = [
    { progress: 0, message: "> INITIALIZING_CORE..." },
    { progress: 25, message: "> ALLOCATING_MEMORY..." },
    { progress: 50, message: "> LOADING_ASSETS..." },
    { progress: 75, message: "> COMPILING_SHADERS..." },
    { progress: 95, message: "> SYSTEM_READY." }
];

export default function Loader({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState([]);
    const [logIndex, setLogIndex] = useState(0);
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const nextMilestone = LOG_THRESHOLDS[logIndex]?.progress || 100;
                const distanceToMilestone = nextMilestone - prev;

                let increment;
                if (distanceToMilestone < 5) {
                    increment = Math.random() * 0.5;
                } else if (distanceToMilestone < 10) {
                    increment = Math.random() * 1.5;
                } else {
                    increment = Math.random() * 3;
                }

                const newProgress = Math.min(prev + increment, 100);

                // Show log message when threshold is reached
                if (logIndex < LOG_THRESHOLDS.length &&
                    newProgress >= LOG_THRESHOLDS[logIndex].progress) {
                    setLogs(prevLogs => [...prevLogs, LOG_THRESHOLDS[logIndex].message]);
                    setLogIndex(prev => prev + 1);
                }

                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsHidden(true);
                        setTimeout(() => onComplete?.(), 300);
                    }, 300);
                }

                return newProgress;
            });
        }, 25);

        return () => clearInterval(interval);
    }, [logIndex, onComplete]);

    return (
        <div className={`loader-container ${isHidden ? 'loader-hidden' : ''}`} id="loader">
            <div className="loader-box">
                <div className="loader-title">LOADING SYSTEM</div>
                <div className="boot-log" id="boot-log">
                    {logs.map((log, index) => (
                        <p key={index} style={{ opacity: 1 }}>{log}</p>
                    ))}
                </div>
                <div className="loader-bar-wrapper">
                    <div className="loader-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="loader-progress">{Math.floor(progress).toString().padStart(2, '0')}%</div>
            </div>
        </div>
    );
}
