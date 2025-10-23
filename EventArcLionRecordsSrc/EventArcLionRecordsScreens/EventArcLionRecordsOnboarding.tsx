import { eventFontsArc } from '../eventFontsArc';
import { useNavigation as useArcNav } from '@react-navigation/native';
import { Animated as ArcAnim } from 'react-native';
import React, {
    useRef as useArcRef,
    useEffect as useArcEffect,
    useState as useArcStep,
} from 'react';
import {
    View as ArcScreen,
    Image as ArcBackdrop,
    useWindowDimensions as useArcViewport,
    Text as ArcText,
    Pressable as ArcPress,
} from 'react-native';

const EventArcLionRecordsOnboarding: React.FC = () => {
    const { width: arcW, height: arcH } = useArcViewport();
    const [arcStep, setArcStep] = useArcStep(0);
    const fadeAnim = useArcRef(new ArcAnim.Value(1)).current;
    const arcNav = useArcNav();

    const onboardingSlides = [
        {
            img: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/arcImagesForOn/arl1.png'),
            title: 'Welcome to the Pride',
            desc: 'Every game has a story, every victory a roar.\nStep into the lion’s world of memories',
        },
        {
            img: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/arcImagesForOn/arl2.png'),
            title: 'Build Your Archive',
            desc: 'Record personal events, world highlights, and legendary athletes — all in one proud arena',
        },
        {
            img: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/arcImagesForOn/arl3.png'),
            title: 'Learn and Challenge',
            desc: 'Read timeless stories from sports history and prove your wisdom in the QuizArc',
        },
    ];

    const handleNextArc = () => {
        const lastIdx = onboardingSlides.length - 1;

        ArcAnim.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (arcStep < lastIdx) {
                setArcStep(prev => prev + 1);
            } else {
                arcNav.replace?.('EventArcLionRecordsMain');
            }

            ArcAnim.timing(fadeAnim, {
                toValue: 1,
                duration: 320,
                useNativeDriver: true,
            }).start();
        });
    };

    useArcEffect(() => {
        fadeAnim.setValue(1);
    }, [arcStep]);

    return (
        <ArcScreen
            style={{
                backgroundColor: '#000',
                flex: 1,
                width: arcW,
                height: arcH,
            }}
        >
            <ArcBackdrop
                resizeMode="cover"
                style={{
                    position: 'absolute',
                    width: arcW,
                    height: arcH,
                    top: 0,
                    left: 0,
                }}
                source={onboardingSlides[arcStep].img}
            />

            <ArcScreen
                style={{
                    paddingVertical: arcH * 0.021,
                    height: arcH * 0.28,
                    alignSelf: 'center',
                    bottom: arcH * 0.05,
                    justifyContent: 'center',
                    width: arcW * 0.9075,
                    backgroundColor: '#330F16',
                    alignItems: 'center',
                    paddingHorizontal: arcW * 0.05,
                    position: 'absolute',
                }}
            >
                <ArcText
                    style={{
                        textAlign: 'center',
                        fontStyle: 'italic',
                        fontFamily: eventFontsArc.eventArcPoppinsSB,
                        color: 'white',
                        fontSize: arcW * 0.08,
                    }}
                    >
                    {onboardingSlides[arcStep].title}
                </ArcText>

                <ArcText
                    style={{
                        marginTop: arcH * 0.015,
                        textAlign: 'center',
                        color: 'white',
                        fontFamily: eventFontsArc.eventArcPoppinsR,
                        fontSize: arcW * 0.035,
                    }}
                >
                    {onboardingSlides[arcStep].desc}
                </ArcText>

                <ArcPress
                    onPress={handleNextArc}
                    style={{
                        backgroundColor: '#E51726',
                        marginTop: arcH * 0.019,
                        width: '100%',
                        height: arcH * 0.057,
                        alignSelf: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ArcText
                        style={{
                            fontSize: arcW * 0.05,
                            fontFamily: eventFontsArc.eventArcPoppinsM,
                            color: 'white',
                        }}
                    >
                        NEXT
                    </ArcText>
                </ArcPress>
            </ArcScreen>
        </ArcScreen>
    );
};

export default EventArcLionRecordsOnboarding;