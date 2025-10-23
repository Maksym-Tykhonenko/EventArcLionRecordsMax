import {
    TouchableOpacity as RecordsTouch,
    View as RecordsView,
    Image as RecordsImg,
    Switch as RecordsSwitch,
    Text as RecordsText,
    Dimensions as RecordsDim,
    Alert as RecordsAlert,
    Modal as RecordsModal,
    Animated as RecordsAnim,
    Easing as RecordsEase,
    Linking,
    Share,
    Platform,
} from 'react-native';
import React, {
    useState as useRecordsState,
    useEffect as useRecordsEffect,
    useRef as useRecordsRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventFontsArc } from '../eventFontsArc';
import RNRestart from 'react-native-restart';

const { width: recW, height: recH } = RecordsDim.get('window');

const shareCopy = `Discover ${Platform.OS === 'android' ? 'CrownArc' : 'EventArc'} Lion Records — your personal sports archive! Save achievements, explore inspiring stories, and challenge yourself with quizzes. Start your journey and make every moment count!`;

const recordsButtons = [
    {
        key: 'share',
        label: 'Share the App',
        icon: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/shareArLio.png'),
        iconStyle: { width: recW * 0.06, height: recW * 0.06, resizeMode: 'contain' },
        justify: 'space-between',
        onPress: () => {
            Share.share({
                message: shareCopy,
            });
        },
    },
    {
        key: 'reset',
        label: 'Reset the App',
        icon: require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/recLIoEvResReload.png'),
        iconStyle: { width: recW * 0.06, height: recW * 0.06, resizeMode: 'contain' },
        justify: 'space-between',
        onPress: () => {},
    },
    {
        key: 'terms',
        label: 'Terms of Use',
        icon: null,
        iconStyle: {},
        justify: 'flex-start',
        onPress: () => {
            Linking.openURL('https://www.termsfeed.com/live/dcddae6b-0b25-43c1-ab5b-b70750bc0ed6');
        },
    },
];

const EventArcSettings: React.FC = () => {
    const [recordsNotif, setRecordsNotif] = useRecordsState(true);
    const [recordsModal, setRecordsModal] = useRecordsState(false);
    const recordsAnim = useRecordsRef(new RecordsAnim.Value(0)).current;

    // Load saved notification setting
    useRecordsEffect(() => {
        AsyncStorage.getItem('recordsNotifSetting').then(val => {
            if (val !== null) setRecordsNotif(val === 'true');
        });
    }, []);

    // Save notification state
    const handleNotifToggle = (value: boolean) => {
        setRecordsNotif(value);
        AsyncStorage.setItem('recordsNotifSetting', value ? 'true' : 'false');
    };

    // Modal show/hide animations
    const revealModal = () => {
        setRecordsModal(true);
        RecordsAnim.timing(recordsAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: RecordsEase.out(RecordsEase.exp),
        }).start();
    };

    const concealModal = () => {
        RecordsAnim.timing(recordsAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: RecordsEase.in(RecordsEase.exp),
        }).start(() => {
            setRecordsModal(false);
            RNRestart.Restart();
        });
    };

    // Reset data handler
    const triggerReset = () => {
        RecordsAlert.alert(
            'Reset App',
            'Are you sure you want to erase all data?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Erase',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        revealModal();
                        setTimeout(concealModal, 1800);
                    },
                },
            ]
        );
    };

    return (
        <RecordsView
            style={{
                alignItems: 'center',
                flex: 1,
                width: recW,
                height: recH,
                paddingTop: recH * 0.05,
            }}
        >
            {/* Notifications Toggle */}
            <RecordsView
                style={{
                    flexDirection: 'row',
                    height: recH * 0.08,
                    justifyContent: 'space-between',
                    paddingHorizontal: recW * 0.05,
                    width: recW * 0.85,
                    backgroundColor: '#2a1014',
                    marginBottom: recH * 0.025,
                    alignItems: 'center',
                }}
            >
                <RecordsText
                    style={{
                        fontSize: recW * 0.048543112,
                        color: 'white',
                        fontFamily: eventFontsArc.eventArcPoppinsR,
                    }}
                >
                    Notifications
                </RecordsText>

                <RecordsSwitch
                    value={recordsNotif}
                    onValueChange={handleNotifToggle}
                    trackColor={{ false: '#e51725d0', true: '#E51726' }}
                    thumbColor={'#fff'}
                    style={{
                        marginTop: recH * 0.021,
                        borderRadius: recW * 0.025,
                    }}
                />
            </RecordsView>

            {/* Settings Buttons */}
            {recordsButtons.map(btn => (
                <RecordsTouch
                    key={btn.key}
                    style={{
                        width: recW * 0.85,
                        alignItems: 'center',
                        justifyContent: btn.justify,
                        height: recH * 0.08,
                        paddingHorizontal: recW * 0.05,
                        backgroundColor: 'rgba(51, 15, 22, 1)',
                        marginBottom: recH * 0.025,
                        flexDirection: 'row',
                    }}
                    onPress={btn.key === 'reset' ? triggerReset : btn.onPress}
                >
                    <RecordsText
                        style={{
                            color: 'white',
                            fontSize: recW * 0.048543112,
                            fontFamily: eventFontsArc.eventArcPoppinsR,
                        }}
                    >
                        {btn.label}
                    </RecordsText>
                    {btn.icon && (
                        <RecordsImg
                            source={btn.icon}
                            style={btn.iconStyle}
                        />
                    )}
                </RecordsTouch>
            ))}

            {/* Animated Modal */}
            <RecordsModal visible={recordsModal} transparent animationType="none">
                <RecordsView
                    style={{
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        flex: 1,
                        alignItems: 'center',
                    }}
                >
                    <RecordsAnim.View
                        style={{
                            opacity: recordsAnim,
                            transform: [
                                {
                                    scale: recordsAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.7, 1],
                                    }),
                                },
                            ],
                            paddingHorizontal: recW * 0.09,
                            borderRadius: recW * 0.04,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 8,
                            shadowColor: '#000',
                            shadowOpacity: 0.7,
                            paddingVertical: recH * 0.04,
                            shadowRadius: 12,
                            backgroundColor: '#330F16',
                        }}
                    >
                        <RecordsText
                            style={{
                                textAlign: 'center',
                                fontFamily: eventFontsArc.eventArcPoppinsR,
                                fontSize: recW * 0.055,
                                color: '#fff',
                            }}
                        >
                            All data successfully erased
                        </RecordsText>
                    </RecordsAnim.View>
                </RecordsView>
            </RecordsModal>
        </RecordsView>
    );
};

export default EventArcSettings;