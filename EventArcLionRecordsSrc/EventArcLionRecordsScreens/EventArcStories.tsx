const { width: arcW, height: arcH } = ArcWindow.get('window');
const PAD = arcW * 0.045;
const CARD_H = arcH * 0.14;
const CARD_W = arcW * 0.03;
const EMOJI_SIZE_LIO = CARD_H * 0.55;
const EMOJI_BG_EVE = CARD_H * 0.75;
const MODAL_R = arcW * 0.06;
const MODAL_PAD = arcW * 0.06;
import recordsSportStoriesData from '../ArcData/recordsSportStoriesData';
const EVE_MODAL_TITLE = arcW * 0.07;
const TAG_MODAL = arcW * 0.04;
const TEXXT_MODAL_LIOAR = arcW * 0.045;
const EVENTAR_ICO = arcW * 0.075;
const PAD_OF_SCROLL_LION = arcH * 0.16;
import React, { useEffect as useArcEffect, useState as useArcState, useRef as useArcRef, } from 'react';
import {
    ScrollView as LiScrollArc,
    SafeAreaView as ArcSafe,
    Share,
    Text as LiArText,
    TouchableOpacity as TouchableOfRecords,
    Image as ImageLioAr,
    Animated as ArcAnim,
    Modal,
    View as LiArScreen,
    Dimensions as ArcWindow,
    Platform,
} from 'react-native';
import { eventFontsArc } from '../eventFontsArc';


const backIcon = require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/backLiArr.png');
const shareIcon = require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/shareArLio.png');

const EventArcStories: React.FC = () => {
    const [activeRecord, setActiveRecord] = useArcState<any>(null);
    const [shakeIndex, setShakeIndex] = useArcState<number | null>(null);
    const shakeAnim = useArcRef(new ArcAnim.Value(0)).current;

    useArcEffect(() => {
        const interval = setInterval(() => {
            const idx = Math.floor(Math.random() * recordsSportStoriesData.length);
            setShakeIndex(idx);
            ArcAnim.sequence([
                ArcAnim.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
                ArcAnim.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
                ArcAnim.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
                ArcAnim.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
            ]).start();
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    return (
        <LiArScreen style={{ flex: 1, width: arcW, height: arcH }}>
            <LiScrollArc
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: PAD_OF_SCROLL_LION, paddingTop: PAD }}
            >
                {recordsSportStoriesData.map((record: any, idx: number) => {
                    const isShaking = shakeIndex === idx;
                    return (
                        <ArcAnim.View
                            key={idx}
                            style={{
                                transform: isShaking
                                    ? [
                                        {
                                            translateX: shakeAnim.interpolate({
                                                inputRange: [-1, 1],
                                                outputRange: [-10, 10],
                                            }),
                                        },
                                    ]
                                    : [],
                            }}
                        >
                            <TouchableOfRecords
                                style={{
                                    height: CARD_H,
                                    alignItems: 'center',
                                    backgroundColor: '#330F16',
                                    flexDirection: 'row',
                                    borderRadius: CARD_W,
                                    marginHorizontal: PAD,
                                    marginBottom: PAD,
                                    padding: PAD,
                                }}
                                onPress={() => setActiveRecord(record)}
                                activeOpacity={0.85}
                            >
                                <LiArScreen
                                    style={{
                                        width: EMOJI_BG_EVE,
                                        marginRight: PAD,
                                        justifyContent: 'center',
                                        height: EMOJI_BG_EVE,
                                        alignItems: 'center',
                                        backgroundColor: '#500409',
                                    }}
                                >
                                    <LiArText style={{ fontSize: EMOJI_SIZE_LIO * 0.7 }}>{record.emoji}</LiArText>
                                </LiArScreen>

                                <LiArScreen style={{ flex: 1 }}>
                                    <LiArText
                                        style={{
                                            fontWeight: '600',
                                            marginBottom: PAD * 0.3,
                                            fontSize: arcW * 0.048,
                                            color: '#fff',
                                        }}
                                    >
                                        {record.title}
                                    </LiArText>
                                    <LiArText
                                        style={{
                                            color: '#965A5A',
                                            fontSize: arcW * 0.031,
                                        }}
                                    >
                                        {record.hashtags.join(' ')}
                                    </LiArText>
                                </LiArScreen>
                            </TouchableOfRecords>
                        </ArcAnim.View>
                    );
                })}
            </LiScrollArc>

            <Modal
                transparent={false}
                visible={!!activeRecord}
                onRequestClose={() => setActiveRecord(null)}
                animationType="slide"
            >
                {activeRecord && (
                    <LiArScreen
                        style={{
                            backgroundColor: '#400d0d',
                            borderTopRightRadius: MODAL_R,
                            flex: 1,
                            borderTopLeftRadius: MODAL_R,
                            paddingTop: MODAL_PAD * 1.2,
                        }}
                    >
                        <ImageLioAr
                            source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/eventArcBackground.png')}
                            resizeMode="cover"
                            style={{
                                width: arcW,
                                position: 'absolute',
                                left: 0,
                                height: arcH,
                                top: 0,
                            }}
                        />

                        <ArcSafe />

                        <LiArScreen
                            style={{
                                justifyContent: 'space-between',
                                flexDirection: 'row',
                                paddingHorizontal: MODAL_PAD,
                                alignItems: 'center',
                                marginBottom: MODAL_PAD * 0.7,
                            }}
                        >
                            <TouchableOfRecords onPress={() => setActiveRecord(null)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ImageLioAr
                                    source={backIcon}
                                    resizeMode="contain"
                                    style={{
                                        width: EVENTAR_ICO,
                                        height: EVENTAR_ICO,
                                        tintColor: '#965A5A',
                                    }}
                                />
                                <LiArText
                                    style={{
                                        color: '#9C7C7C',
                                        fontSize: EVENTAR_ICO * 0.68,
                                        marginLeft: 3,
                                        fontFamily: eventFontsArc.eventArcPoppinsR,
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    Back
                                </LiArText>
                            </TouchableOfRecords>
                            <TouchableOfRecords style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                                Share.share({
                                    message: `${activeRecord.title}\n\n${activeRecord.description}\n\n${activeRecord.hashtags.join(' ')}\n\nShared via ${Platform.OS === 'android' ? 'Crown' : 'Event'}Arc Lion Records App.`,
                                })
                            }}>
                                <ImageLioAr
                                    source={shareIcon}
                                    resizeMode="contain"
                                    style={{
                                        width: EVENTAR_ICO,
                                        height: EVENTAR_ICO,
                                        tintColor: '#E51726',
                                    }}
                                />
                                <LiArText
                                    style={{
                                        marginLeft: 10,
                                        color: '#E51726',
                                        letterSpacing: 0.5,
                                        fontFamily: eventFontsArc.eventArcPoppinsSB,
                                        fontSize: EVENTAR_ICO * 0.68,
                                    }}
                                >
                                    Share
                                </LiArText>
                            </TouchableOfRecords>
                        </LiArScreen>

                        <LiArScreen style={{ flex: 1, paddingHorizontal: MODAL_PAD }}>
                            <LiArScreen
                                style={{
                                    marginBottom: MODAL_PAD * 0.7,
                                    flexDirection: 'row',
                                    width: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <LiArScreen
                                    style={{
                                        width: EMOJI_BG_EVE * 0.85,
                                        height: EMOJI_BG_EVE * 0.85,
                                        alignItems: 'center',
                                        backgroundColor: '#500409',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <LiArText style={{ fontSize: EMOJI_SIZE_LIO * 0.7 }}>
                                        {activeRecord.emoji}
                                    </LiArText>
                                </LiArScreen>

                                <LiArText
                                    style={{
                                        fontFamily: eventFontsArc.eventArcPoppinsM,
                                        flex: 1,
                                        color: '#fff',
                                        marginLeft: MODAL_PAD,
                                        fontSize: EVE_MODAL_TITLE * 0.8,
                                    }}
                                    numberOfLines={2}
                                    adjustsFontSizeToFit
                                >
                                    {activeRecord.title.toUpperCase()}
                                </LiArText>
                            </LiArScreen>

                            <LiScrollArc
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: arcH * 0.1 }}
                            >
                                <LiArText
                                    style={{
                                        color: '#965A5A',
                                        fontSize: TAG_MODAL,
                                        marginBottom: MODAL_PAD * 0.7,
                                    }}
                                >
                                    {activeRecord.hashtags.join(' ')}
                                </LiArText>

                                <LiArText
                                    style={{
                                        color: '#fff',
                                        fontSize: TEXXT_MODAL_LIOAR,
                                        lineHeight: TEXXT_MODAL_LIOAR * 1.5,
                                    }}
                                >
                                    {activeRecord.description}
                                </LiArText>
                            </LiScrollArc>
                        </LiArScreen>
                    </LiArScreen>
                )}
            </Modal>
        </LiArScreen>
    );
};

export default EventArcStories;