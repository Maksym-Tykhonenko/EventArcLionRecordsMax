import { eventFontsArc } from '../eventFontsArc';
import * as Animatable from 'react-native-animatable';
const TYPEWRITER_SPEED = 55; // ms per character
const EVENT_ARC_FIRST_LAUNCH = 'eventarc_lionrecords_first_launch';

const TYPEWRITER_TEXT = Platform.OS === 'android' ? "CrownArc Lion\nRecords" : "EventArc Lion\nRecords";

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useLayoutEffect as useArcLayout, useEffect, useState, useRef } from 'react';
import { useNavigation as useArcNav } from '@react-navigation/native';
import {
    Text as ArcText,
    Dimensions as ArcScreen,
    View as ArcContainer,
    Image as ArcImage,
    Platform,
} from 'react-native';

const EventArcLionRecordsLoading: React.FC = () => {
    const { width: arcW, height: arcH } = ArcScreen.get('window');
    const arcNav = useArcNav();

    const [showText, setShowText] = useState(false);
    const [typedText, setTypedText] = useState('');
    const logoRef = useRef<Animatable.View>(null);

    useArcLayout(() => {
        let shouldShowOnboarding = false;

        const initEventArcApp = async () => {
            try {
                const [storedFlag, userProfile] = await Promise.all([
                    AsyncStorage.getItem(EVENT_ARC_FIRST_LAUNCH),
                    AsyncStorage.getItem('eventArcLionRecordsUser'),
                ]);

                if (!storedFlag && !userProfile) {
                    shouldShowOnboarding = true;
                    await AsyncStorage.setItem(EVENT_ARC_FIRST_LAUNCH, 'true');
                }
            } catch (err) {
                if (__DEV__) console.warn('EventArcLionRecordsLoading init:', err);
            }

            //setTimeout(() => {
            //    arcNav.replace(
            //        shouldShowOnboarding
            //            ? 'EventArcLionRecordsOnboarding'
            //            : 'EventArcLionRecordsMain'
            //    );
            //}, 4000);
        };

        initEventArcApp();
    }, [arcNav]);

    // Animate logo on mount
    useEffect(() => {
        if (logoRef.current) {
            logoRef.current.animate(
                {
                    0: { opacity: 0, scale: 0.7, rotate: '0deg' },
                    0.5: { opacity: 1, scale: 1.2, rotate: '360deg' },
                    1: { opacity: 1, scale: 1, rotate: '0deg' },
                },
                5000
            ).then(() => setShowText(true));
        }
    }, []);

    // Typewriter effect for text
    useEffect(() => {
        if (!showText) return;
        let i = 0;
        setTypedText('');
        const interval = setInterval(() => {
            setTypedText(TYPEWRITER_TEXT.slice(0, i + 1));
            i++;
            if (i >= TYPEWRITER_TEXT.length) clearInterval(interval);
        }, TYPEWRITER_SPEED);
        return () => clearInterval(interval);
    }, [showText]);

    return (
        <ArcContainer
            style={{
                width: arcW,
                alignItems: 'center',
                backgroundColor: '#0B0B0B',
                height: arcH,
                flex: 1,
                justifyContent: 'center',
            }}
        >
            <ArcImage
                source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/eventArcBackground.png')}
                resizeMode="cover"
                style={{
                    top: 0,
                    position: 'absolute',
                    left: 0,
                    height: arcH,
                    width: arcW,
                }}
            />
            {/* Animated logo */}
            <Animatable.View
                ref={logoRef}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: arcW * 0.77,
                    alignSelf: 'center',
                    width: arcW * 0.77,
                }}
            >
                <ArcImage
                    source={Platform.OS === 'android'
                        ? require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/andrLogoArc.png')
                        : require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/logoEvent.png')}
                    resizeMode="contain"
                    style={{
                        height: arcW * 0.77,
                        alignSelf: 'center',
                        width: arcW * 0.77,
                    }}
                />
            </Animatable.View>

            {/* Typewriter text */}
            {showText && (
                <ArcText
                    style={{
                        position: 'absolute',
                        fontStyle: 'italic',
                        fontSize: arcW * 0.1,
                        color: 'white',
                        textAlign: 'center',
                        bottom: arcH * 0.06,
                        alignSelf: 'center',
                        fontFamily: eventFontsArc.eventArcPoppinsBI,
                    }}
                >
                    {typedText}
                </ArcText>
            )}
        </ArcContainer>
    );
};

export default EventArcLionRecordsLoading;