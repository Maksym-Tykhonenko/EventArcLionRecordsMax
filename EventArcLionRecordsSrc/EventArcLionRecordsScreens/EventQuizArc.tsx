import React, { useState, useEffect, } from 'react';
import {
    Image as RecoImageL,
    Share, // додано імпорт
    Text as TextLioAr,
    SafeAreaView as RecSafeLion,
    TouchableOpacity,
    View as RecViewEve,
    Dimensions as DImLionRec,
    Platform,
} from 'react-native';
import { eventFontsArc } from '../eventFontsArc';
import lionRecsQuiz from '../ArcData/lionRecsQuiz';

const { width: arcW, height: arcH } = DImLionRec.get('window');

// Responsive units
const unit = Math.min(arcW, arcH) / 430;
const optionFont = unit * 16;
const btnFont = unit * 18;
const logoSize = arcW * 0.59;
const optionHeight = unit * 48;
const padding = unit * 20;
const btnHeight = unit * 48;

const lionLogo = Platform.OS === 'android'
    ? require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/andrLogoArc.png')
    : require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/logoEvent.png');

const totalQuestions = 15;

function formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} minute${m !== 1 ? 's' : ''} and ${s} second${s !== 1 ? 's' : ''}`;
}

function getRandomQuestionsByLevel(questions, level, count) {
    const filtered = questions.filter(q => q.level === level);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

const EventQuizArc: React.FC = () => {
    // Screens: 'preview', 'quiz', 'result'
    const [screen, setScreen] = useState<'preview' | 'quiz' | 'result'>('preview');
    const [current, setCurrent] = useState(0);
    const [timer, setTimer] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [running, setRunning] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);
    const [quizQuestions, setQuizQuestions] = useState([]);

    // --- формування 15 питань: по 5 з кожної складності, по порядку ---
    useEffect(() => {
        if (screen === 'preview') {
            const easy = getRandomQuestionsByLevel(lionRecsQuiz, 'Easy', 5);
            const medium = getRandomQuestionsByLevel(lionRecsQuiz, 'Medium', 5);
            const hard = getRandomQuestionsByLevel(lionRecsQuiz, 'Hard', 5);
            const ordered = [...easy, ...medium, ...hard]; // без перемішування
            setQuizQuestions(ordered);
        }
    }, [screen]);

    // Timer effect
    useEffect(() => {
        let interval: any;
        if (screen === 'quiz' && running) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [screen, running]);

    // Start quiz
    const startQuiz = () => {
        setScreen('quiz');
        setCurrent(0);
        setAnswers([]);
        setCorrectCount(0);
        setTimer(0);
        setRunning(true);
        setSelected(null);
    };

    // Handle answer
    const handleAnswer = (idx: number) => {
        if (selected !== null) return;
        setSelected(idx);
        setAnswers([...answers, idx]);
        if (idx === quizQuestions[current].correct) {
            setCorrectCount(c => c + 1);
        }
        setTimeout(() => {
            if (current + 1 < totalQuestions) {
                setCurrent(c => c + 1);
                setSelected(null);
            } else {
                setScreen('result');
                setRunning(false);
            }
        }, 900);
    };

    // Home button
    const goHome = () => {
        setScreen('preview');
        setCurrent(0);
        setAnswers([]);
        setCorrectCount(0);
        setTimer(0);
        setRunning(false);
        setSelected(null);
    };

    // Share button
    const shareResult = async () => {
        try {
            await Share.share({
                message:
                    `My QuizArc Result:\n` +
                    `Correct answers: ${correctCount} out of ${totalQuestions}\n` +
                    `Time: ${formatTime(timer)}\n` +
                    `Roar with me in ${Platform.OS === 'android' ? 'Crown' : 'Event'}Arc Lion Records app! 🦁`,
            });
        } catch (error) {
            // Можна додати обробку помилки, якщо потрібно
        }
    };

    // --- UI ---
    // Preview Screen
    if (screen === 'preview') {
        return (
            <RecSafeLion style={{ flex: 1 }}>
                <RecViewEve style={{ alignItems: 'center', marginTop: arcH * 0.08 }}>
                    <RecoImageL
                        source={lionLogo}
                        style={{
                            width: logoSize,
                            marginBottom: arcH * 0.04,
                            resizeMode: 'contain',
                            height: logoSize,
                        }}
                    />
                    <RecViewEve
                        style={{
                            width: arcW * 0.88,
                            marginBottom: arcH * 0.06,
                            padding: padding,
                            backgroundColor: '#2C1010',
                        }}
                    >
                        <TextLioAr
                            style={{
                                textAlign: 'center',
                                fontFamily: eventFontsArc.eventArcPoppinsM,
                                marginBottom: unit * 6,
                                fontSize: unit * 16,
                                color: '#fff',
                            }}
                        >
                            The lion tests both memory and might. You’ll face fifteen unique questions, balanced across three difficulty levels. Think clearly. Roar proudly
                        </TextLioAr>
                    </RecViewEve>
                    <TouchableOpacity
                        style={{
                            justifyContent: 'center',
                            backgroundColor: '#E51726',
                            alignItems: 'center',
                            width: arcW * 0.88,
                            height: btnHeight,
                        }}
                        onPress={startQuiz}
                        activeOpacity={0.85}
                    >
                        <TextLioAr
                            style={{
                                letterSpacing: 1,
                                fontSize: btnFont,
                                fontFamily: eventFontsArc.eventArcPoppinsM,
                                color: '#fff',
                            }}
                        >
                            START QUIZ
                        </TextLioAr>
                    </TouchableOpacity>
                </RecViewEve>
            </RecSafeLion>
        );
    }

    // Quiz Screen
    if (screen === 'quiz') {
        const q = quizQuestions[current];
        return (
            <RecSafeLion style={{ flex: 1 }}>
                <RecViewEve style={{ padding: padding, flex: 1 }}>
                    {/* Timer & Pause */}
                    <RecViewEve style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: unit * 18, alignItems: 'center' }}>
                        <TextLioAr
                            style={{
                                fontSize: unit * 25,
                                color: '#fff',
                                fontFamily: eventFontsArc.eventArcPoppinsSB,
                                fontStyle: 'italic',
                            }}
                        >
                            {timer < 10 ? `00:0${timer}` : `00:${timer < 60 ? timer : timer % 60}`}
                        </TextLioAr>
                        <TextLioAr
                            style={{
                                color: '#fff',
                                fontFamily: eventFontsArc.eventArcPoppinsSB,
                                fontSize: unit * 21,
                            }}
                        >
                            Pause
                        </TextLioAr>
                    </RecViewEve>
                    {/* Question Progress */}
                    <TextLioAr
                        style={{
                            marginBottom: unit * 8,
                            marginTop: arcH * 0.04,
                            fontStyle: 'italic',
                            fontSize: unit * 25,
                            color: '#fff',
                            textAlign: 'center',
                            fontFamily: eventFontsArc.eventArcPoppinsB,
                        }}
                    >
                        Question {current + 1} of {totalQuestions}
                    </TextLioAr>
                    <TextLioAr
                        style={{
                            marginBottom: unit * 12,
                            fontFamily: eventFontsArc.eventArcPoppinsM,
                            fontSize: unit * 16,
                            textAlign: 'center',
                            fontStyle: 'italic',
                            color: '#fff',
                        }}
                    >
                        {q.level}
                    </TextLioAr>
                    {/* Question */}
                    <TextLioAr
                        style={{
                            color: '#fff',
                            fontFamily: eventFontsArc.eventArcPoppinsM,
                            fontSize: arcW * 0.05,
                            marginTop: arcH * 0.021,
                            textAlign: 'center',
                            marginBottom: unit * 22,
                        }}
                    >
                        {q.question}
                    </TextLioAr>
                    {/* Options */}
                    {q.options.map((opt, idx) => {
                        let bg = '#330F16';
                        let color = '#fff';
                        if (selected !== null) {
                            if (idx === q.correct) {
                                bg = '#34C759';
                                color = '#fff';
                            } else if (idx === selected) {
                                bg = '#FF383C';
                                color = '#fff';
                            }
                        }
                        return (
                            <TouchableOpacity
                                key={idx}
                                style={{
                                    alignItems: 'center',
                                    height: optionHeight * 1.4,
                                    marginBottom: unit * 12,
                                    opacity: selected !== null && selected !== idx && idx !== q.correct ? 0.6 : 1,
                                    backgroundColor: bg,
                                    flexDirection: 'row',
                                    paddingHorizontal: unit * 18,
                                }}
                                onPress={() => handleAnswer(idx)}
                                activeOpacity={0.85}
                                disabled={selected !== null}
                            >
                                <RecViewEve style={{
                                    height: optionHeight * 0.75,
                                    justifyContent: 'center',
                                    backgroundColor: selected !== null ? 'transparent' : '#965A5A',
                                    marginRight: unit * 12,
                                    width: optionHeight * 0.75,
                                    alignItems: 'center',
                                }}>
                                    <TextLioAr
                                        style={{
                                            fontSize: optionFont * 1.2,
                                            textAlign: 'center',
                                            fontFamily: eventFontsArc.eventArcPoppinsSB,
                                            color: color,
                                        }}
                                    >
                                        {String.fromCharCode(65 + idx)}
                                    </TextLioAr>
                                </RecViewEve>
                                <TextLioAr
                                    style={{
                                        color: color,
                                        fontFamily: eventFontsArc.eventArcPoppinsR,
                                        fontSize: optionFont * 1.2,
                                        width: arcW * 0.71,
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    {opt}
                                </TextLioAr>
                            </TouchableOpacity>
                        );
                    })}
                </RecViewEve>
            </RecSafeLion>
        );
    }

    // Result Screen
    if (screen === 'result') {
        return (
            <RecSafeLion style={{ flex: 1 }}>
                <RecViewEve style={{ alignItems: 'center', marginTop: arcH * 0.0119 }}>
                    <RecoImageL
                        source={lionLogo}
                        style={{
                            resizeMode: 'contain',
                            marginBottom: arcH * 0.04,
                            height: logoSize,
                            width: logoSize,
                        }}
                    />
                    <TextLioAr
                        style={{
                            color: '#fff',
                            marginBottom: unit * 12,
                            textAlign: 'center',
                            fontStyle: 'italic',
                            fontSize: unit * 25,
                            fontFamily: eventFontsArc.eventArcPoppinsB,
                        }}
                    >
                        Your Roar Results
                    </TextLioAr>
                    <TextLioAr
                        style={{
                            textAlign: 'center',
                            marginBottom: unit * 16,
                            fontFamily: eventFontsArc.eventArcPoppinsM,
                            color: '#fff',
                            paddingHorizontal: unit * 16,
                            fontSize: unit * 21,
                        }}
                    >
                        You’ve answered {correctCount} out of {totalQuestions} questions correctly in {formatTime(timer)}. {'\n\n'}
                        The arc glows brighter with every right answer — wisdom is your endurance, focus your strength
                    </TextLioAr>
                    <TouchableOpacity
                        style={{
                            marginBottom: unit * 16,
                            backgroundColor: '#E51726',
                            alignItems: 'center',
                            height: btnHeight,
                            justifyContent: 'center',
                            width: arcW * 0.88,
                        }}
                        onPress={goHome}
                        activeOpacity={0.85}
                    >
                        <TextLioAr
                            style={{
                                color: '#fff',
                                fontFamily: eventFontsArc.eventArcPoppinsM,
                                fontSize: btnFont,
                                letterSpacing: 1,
                            }}
                        >
                            HOME
                        </TextLioAr>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{
                            backgroundColor: '#965A5A',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: btnHeight,
                            width: arcW * 0.88,
                            flexDirection: 'row',
                        }}
                        onPress={shareResult}
                        activeOpacity={0.85}
                    >
                        <RecoImageL
                            source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/shareArLio.png')}
                            resizeMode="contain"
                            style={{
                                tintColor: 'white',
                                height: arcW * 0.061,
                                marginRight: unit * 12,
                                width: arcW * 0.061,
                            }}
                        />
                        <TextLioAr
                            style={{
                                letterSpacing: 1,
                                color: '#fff',
                                marginRight: unit * 8,
                                fontSize: btnFont,
                                fontFamily: eventFontsArc.eventArcPoppinsM,
                            }}
                        >
                            SHARE
                        </TextLioAr>
                    </TouchableOpacity>
                </RecViewEve>
            </RecSafeLion>
        );
    }

    return null;
};

export default EventQuizArc;