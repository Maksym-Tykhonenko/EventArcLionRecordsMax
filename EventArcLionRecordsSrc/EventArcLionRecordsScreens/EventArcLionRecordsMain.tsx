import EventArcArchive from './EventArcArchive';
import EventQuizArc from './EventQuizArc';
import EventArcSettings from './EventArcSettings';
import EventArcStories from './EventArcStories';
import { eventFontsArc } from '../eventFontsArc';
import React, { useState as useScenePhase } from 'react';
import {
    Dimensions as lioEventScreenFrame,
    Platform as DeviceOS,
    Keyboard,
    TouchableOpacity as RecordPress,
    TouchableWithoutFeedback,
    Text as ArenaText,
    View as ArenaView,
    SafeAreaView,
    Image as RecordImage,
} from 'react-native';


// типи екранів додатка
type LionRecordScreens =
    | 'Arena Archive'
    | 'Lion Stories'
    | 'Event Quiz'
    | 'Settings Hub';

// конфігурація нижнього меню
const lionBottomNav: { title: string; icon: any; page: LionRecordScreens }[] = [
    {
        icon: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/lionRecordsBts/archive.png'),
        page: 'Arena Archive' as LionRecordScreens,
        title: "YOUR LION'S ARENA",
    },
    {
        title: 'LEGENDS WRITTEN IN SWEAT AND TIME',
        page: 'Lion Stories' as LionRecordScreens,
        icon: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/lionRecordsBts/strories.png'),
    },
    {
        page: 'Event Quiz' as LionRecordScreens,
        title: 'QUIZARC',
        icon: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/lionRecordsBts/quizArc.png'),
    },
    {
        page: 'Settings Hub' as LionRecordScreens,
        icon: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/lionRecordsBts/settings.png'),
        title: 'SETTINGS',
    },
];

const { width: screenW, height: screenH } = lioEventScreenFrame.get('window');

const EventArcLionRecordsMain: React.FC = () => {
    const [lioEventScreenFrame, setLioEventScreenFrame] = useScenePhase({ width: screenW, height: screenH });
    const [recArCurScene, setRecArCurScene] = useScenePhase<LionRecordScreens>('Arena Archive');
    const [headerText, setHeaderText] = useScenePhase("YOUR LION'S ARENA");

    // відображення активного екрану
    const renderScene = () => {
        switch (recArCurScene) {
            case 'Arena Archive':
                return <EventArcArchive />;
            case 'Lion Stories':
                return <EventArcStories />;
            case 'Event Quiz':
                return <EventQuizArc />;
            case 'Settings Hub':
                return <EventArcSettings />;
            default:
                return (
                    <ArenaView>
                        <ArenaText style={{ color: 'white' }}>Unknown screen</ArenaText>
                    </ArenaView>
                );
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <ArenaView
                style={{
                    width: lioEventScreenFrame.width,
                    flex: 1,
                    height: lioEventScreenFrame.height,
                }}
            >
                {/* Background */}
                <RecordImage
                    source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/eventArcBackground.png')}
                    resizeMode="cover"
                    style={{
                        width: lioEventScreenFrame.width,
                        top: 0,
                        height: lioEventScreenFrame.height,
                        left: 0,
                        position: 'absolute',
                    }}
                />

                {/* Android padding */}
                {DeviceOS.OS === 'android' && (
                    <ArenaView
                        style={{
                            paddingTop: lioEventScreenFrame.height * 0.0412,
                        }}
                    />
                )}

                <SafeAreaView />

                {/* Header */}
                <ArenaText
                    style={{
                        fontSize: lioEventScreenFrame.width * 0.061,
                        marginBottom: screenH * 0.01,
                        fontFamily: eventFontsArc.eventArcPoppinsSB,
                        color: '#fff',
                        alignSelf: 'center',
                        letterSpacing: 1,
                        width: lioEventScreenFrame.width * 0.93,
                        textAlign: 'center',
                    }}
                >
                    {headerText}
                </ArenaText>

                {/* Main scene */}
                {renderScene()}

                {/* Bottom navigation */}
                <ArenaView
                    style={{
                        justifyContent: 'space-between',
                        bottom: 0,
                        position: 'absolute',
                        backgroundColor: '#330F16',
                        height: lioEventScreenFrame.height * 0.111,
                        alignSelf: 'center',
                        paddingHorizontal: lioEventScreenFrame.width * 0.061,
                        alignItems: 'center',
                        width: lioEventScreenFrame.width,
                        paddingBottom: lioEventScreenFrame.height * 0.012,
                        flexDirection: 'row',
                    }}
                >
                    {lionBottomNav.map((btn, index) => (
                        <RecordPress
                            key={index}
                            activeOpacity={0.7}
                            onPress={() => {
                                setRecArCurScene(btn.page);
                                setHeaderText(btn.title);
                            }}
                            style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <RecordImage
                                source={btn.icon}
                                resizeMode="contain"
                                style={{
                                    height: lioEventScreenFrame.height * 0.055,
                                    width: lioEventScreenFrame.width * 0.19,
                                    tintColor: recArCurScene === btn.page ? '#E51726' : '#965A5A',
                                }}
                            />
                        </RecordPress>
                    ))}
                </ArenaView>
            </ArenaView>
        </TouchableWithoutFeedback>
    );
};

export default EventArcLionRecordsMain;