import {
    Modal as RecordsModal,
    View as RecordsView,
    Image as RecordsImg,
    Text as RecordsText,
    Dimensions as RecordsDim,
    ScrollView as RecordsScroll,
    Alert as RecordsAlert,
    Animated as RecordsAnim,
    TextInput as RecordsInput,
    TouchableOpacity as RecordsTouch,
    SafeAreaView,
} from 'react-native';
import React, {
    useRef as useRecordsRef,
    useState as useRecordsState,
    useEffect as useRecordsEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eventFontsArc } from '../eventFontsArc';
import { launchImageLibrary } from 'react-native-image-picker';

// For blur effect
import { BlurView } from '@react-native-community/blur';

const { width: recW, height: recH } = RecordsDim.get('window');

const ENTRY_TYPES = [
    { key: 'myEvents', label: 'My Events' },
    { key: 'worldEvents', label: 'World Events' },
    { key: 'athletes', label: 'Athletes' },
];

const tabLabels = ['My Events', 'World Events', 'Athletes'];

const EntryModalFields = {
    myEvents: [
        { label: 'Event Title', key: 'title', type: 'text' },
        { label: 'Sport Type', key: 'sportType', type: 'dropdown' },
        { label: 'Date', key: 'date', type: 'date' },
        { label: 'Duration', key: 'duration', type: 'text' },
        { label: 'Location', key: 'location', type: 'text' },
        { label: 'Goal for Event', key: 'goal', type: 'text' },
        { label: 'Notes', key: 'notes', type: 'text' },
        { label: 'Attachment', key: 'attachment', type: 'attachment' },
    ],
    worldEvents: [
        { label: 'Event Title', key: 'title', type: 'text' },
        { label: 'Sport Type', key: 'sportType', type: 'dropdown' },
        { label: 'Date', key: 'date', type: 'date' },
        { label: 'City / Country', key: 'cityCountry', type: 'text' },
        { label: 'Notes', key: 'notes', type: 'text' },
        { label: 'Attachment', key: 'attachment', type: 'attachment' },
    ],
    athletes: [
        { label: 'Name', key: 'name', type: 'text' },
        { label: 'Date of Birth', key: 'dob', type: 'date' },
        { label: 'Country', key: 'country', type: 'text' },
        { label: 'Primary Sport', key: 'primarySport', type: 'dropdown' },
        { label: 'Biography', key: 'bio', type: 'text' },
        { label: 'Notes', key: 'notes', type: 'text' },
        { label: 'Attachment', key: 'attachment', type: 'attachment' },
    ],
};

const STORAGE_KEYS = {
    myEvents: 'arc_myEvents',
    worldEvents: 'arc_worldEvents',
    athletes: 'arc_athletes',
};

const SPORT_OPTIONS = [
    'Running / Track & Field',
    'Marathon / Long-distance',
    'Triathlon / Duathlon',
    'Cycling (Road / Mountain / BMX)',
    'Swimming / Open Water',
    'Rowing / Canoeing / Kayaking',
    'Skiing / Snowboarding',
    'Skating (Speed / Figure)',
    'Climbing / Mountaineering',
    'Surfing / Sailing / Windsurfing',
    'Football / Soccer',
    'Basketball',
    'Volleyball / Beach Volleyball',
    'Handball',
    'Hockey (Field / Ice)',
    'Baseball / Softball',
    'Rugby / American Football',
    'Cricket',
    'Water Polo',
    'Boxing / Kickboxing',
    'Wrestling / Judo',
    'Karate / Taekwondo',
];

const validateDate = (val: string) => {
    // dd.mm.yyyy
    const match = val.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return false;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (year < 2000 || month < 1 || month > 12 || day < 1) return false;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;
    return true;
};

const validateTime = (val: string) => {
    // hh:mm
    const match = val.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const hour = Number(match[1]);
    const min = Number(match[2]);
    if (hour < 0 || hour > 23 || min < 0 || min > 59) return false;
    return true;
};

const formatTimeInput = (val: string) => {
    // Only digits, max 4
    let digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
        return digits.slice(0, 2) + ':' + digits.slice(2);
    }
    return digits;
};

const formatDateInput = (val: string) => {
    // Only digits, max 8
    let digits = val.replace(/\D/g, '').slice(0, 8);
    let day = digits.slice(0, 2);
    let month = digits.slice(2, 4);
    let year = digits.slice(4, 8);

    // Auto-correct day
    if (day.length === 2) {
        let d = Number(day);
        if (d < 1) d = 1;
        if (d > 31) d = 31;
        day = d.toString().padStart(2, '0');
    }
    // Auto-correct month
    if (month.length === 2) {
        let m = Number(month);
        if (m < 1) m = 1;
        if (m > 12) m = 12;
        month = m.toString().padStart(2, '0');
    }
    // Auto-correct year
    if (year.length === 4) {
        let y = Number(year);
        const currentYear = new Date().getFullYear();
        if (y < 2000) y = currentYear;
        year = y.toString();
    }

    let result = '';
    if (day) result += day;
    if (month) result += '.' + month;
    if (year) result += '.' + year;
    return result;
};

const EntryForm = ({ type, onClose, showSaved }: { type: string, onClose: () => void, showSaved: () => void }) => {
    const fields = EntryModalFields[type];
    const [form, setForm] = useRecordsState({});
    const [saving, setSaving] = useRecordsState(false);
    const [dropdownVisible, setDropdownVisible] = useRecordsState(false);
    const [dropdownField, setDropdownField] = useRecordsState<string | null>(null);
    const [imageUri, setImageUri] = useRecordsState<string | null>(null);
    const [images, setImages] = useRecordsState<string[]>([]);

    // Validation state
    const dateField = fields.find(f => f.type === 'date');
    const durationField = fields.find(f => f.key === 'duration');
    const dateValue = dateField ? form[dateField.key] || '' : '';
    const durationValue = durationField ? form[durationField.key] || '' : '';
    const dateValid = !dateField || validateDate(dateValue);
    const durationValid = !durationField || validateTime(durationValue);

    // Check if all fields are filled and valid (except attachment, which can be optional)
    const allFilled = fields.every(f =>
        f.type === 'attachment'
            ? true
            : !!form[f.key] && String(form[f.key]).trim().length > 0
    ) && dateValid && durationValid;

    const handleSave = async () => {
        if (!allFilled || saving) return;
        setSaving(true);
        try {
            // Generate unique id using timestamp and random number
            const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
            const entry = { ...form, id: uniqueId, createdAt: Date.now() };
            const key = STORAGE_KEYS[type];
            const raw = await AsyncStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            arr.push(entry);
            await AsyncStorage.setItem(key, JSON.stringify(arr));
            setForm({});
            if (showSaved) showSaved();
            onClose();
        } catch (e) {
            RecordsAlert.alert('Error', 'Could not save entry');
        }
        setSaving(false);
    };

    const handleDropdownSelect = (value: string) => {
        setForm({ ...form, [dropdownField!]: value });
        setDropdownVisible(false);
        setDropdownField(null);
    };

    const handlePickImage = async () => {
        if (images.length >= 4) return;
        launchImageLibrary(
            {
                mediaType: 'photo',
                selectionLimit: 4 - images.length, // only allow up to 4 total
            },
            (response) => {
                if (response && response.assets && response.assets.length > 0) {
                    const uris = response.assets.map(a => a.uri).filter(Boolean) as string[];
                    setImages(prev => {
                        const next = [...prev, ...uris].slice(0, 4);
                        setForm({ ...form, attachment: next });
                        return next;
                    });
                }
            }
        );
    };

    const handleRemoveImage = (idx: number) => {
        setImages(prev => {
            const next = prev.filter((_, i) => i !== idx);
            setForm({ ...form, attachment: next });
            return next;
        });
    };

    return (
        <RecordsModal visible={!!type} animationType="slide" transparent>
            <RecordsView style={{
                paddingTop: recH * 0.05,
                flex: 1,
                backgroundColor: '#4C0607',
            }}>
                <SafeAreaView />
                <RecordsView style={{
                    justifyContent: 'space-between',
                    paddingHorizontal: recW * 0.05,
                    alignItems: 'center',
                    flexDirection: 'row',
                }}>
                    <RecordsTouch onPress={onClose} style={{
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <RecordsImg
                            source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/backLiArr.png')}
                            resizeMode="contain"
                            style={{
                                width: recW * 0.068,
                                height: recW * 0.068,
                                tintColor: '#965A5A',
                            }}
                        />
                        <RecordsText style={{ color: '#965A5A', fontFamily: eventFontsArc.eventArcPoppinsM, fontSize: recW * 0.045 }}>{'Back'}</RecordsText>
                    </RecordsTouch>

                    <RecordsTouch onPress={handleSave} disabled={!allFilled || saving}>
                        <RecordsText style={{
                            color: allFilled ? '#fff' : '#965A5A',
                            fontSize: recW * 0.045,
                            fontFamily: eventFontsArc.eventArcPoppinsM,
                        }}>
                            Save
                        </RecordsText>
                    </RecordsTouch>
                </RecordsView>

                <RecordsText style={{
                    fontSize: recW * 0.05,
                    alignSelf: 'center',
                    color: '#fff',
                    fontFamily: eventFontsArc.eventArcPoppinsSB,
                    fontWeight: 'bold',
                }}>
                    {type === 'myEvents' ? 'MY EVENTS' : type === 'worldEvents' ? 'WORLD EVENTS' : 'ATHLETES'}
                </RecordsText>
                <RecordsScroll style={{
                    marginTop: recH * 0.03,
                    paddingHorizontal: recW * 0.05,
                }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: recH * 0.1 }}>
                    {fields.map((f, idx) => (
                        <RecordsView key={f.key} style={{ marginBottom: recH * 0.022, position: 'relative' }}>
                            {/* Duration field for myEvents */}
                            {f.type === 'text' && f.key === 'duration' && type === 'myEvents' ? (
                                <RecordsView style={{
                                    backgroundColor: '#330F16',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: recH * 0.018,
                                    borderWidth: durationValue && !durationValid ? 2 : 0,
                                    borderColor: durationValue && !durationValid ? '#E51726' : undefined,
                                }}>
                                    <RecordsInput
                                        style={{
                                            color: '#fff',
                                            fontSize: recW * 0.04,
                                            flex: 1,
                                            fontFamily: eventFontsArc.eventArcPoppinsR,
                                        }}
                                        onChangeText={v => setForm({ ...form, [f.key]: formatTimeInput(v) })}
                                        placeholder="hh:mm"
                                        keyboardType="numeric"
                                        value={durationValue}
                                        placeholderTextColor="#a88"
                                    />
                                    <RecordsImg
                                        source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/arcLioRecClock.png')}
                                        resizeMode="contain"
                                        style={{
                                            width: recW * 0.059,
                                            height: recW * 0.059,
                                            marginLeft: recW * 0.03,
                                        }}
                                    />
                                </RecordsView>
                            ) : f.type === 'date' ? (
                                <RecordsInput
                                    style={{
                                        borderColor: dateValue && !dateValid ? '#E51726' : undefined,
                                        borderWidth: dateValue && !dateValid ? 2 : 0,
                                        color: '#fff',
                                        padding: recH * 0.018,
                                        fontSize: recW * 0.04,
                                        fontFamily: eventFontsArc.eventArcPoppinsR,
                                        backgroundColor: '#330F16',
                                    }}
                                    placeholder="dd.mm.yyyy"
                                    placeholderTextColor="#a88"
                                    value={dateValue}
                                    onChangeText={v => setForm({ ...form, [f.key]: formatDateInput(v) })}
                                    keyboardType="numeric"
                                />
                            ) : f.type === 'text' ? (
                                <RecordsInput
                                    style={{
                                        backgroundColor: '#330F16',
                                        color: '#fff',
                                        padding: recH * 0.018,
                                        fontSize: recW * 0.04,
                                        fontFamily: eventFontsArc.eventArcPoppinsR,
                                    }}
                                    placeholder={f.label}
                                    placeholderTextColor="#a88"
                                    value={form[f.key] || ''}
                                    onChangeText={v => setForm({ ...form, [f.key]: v })}
                                />
                            ) : f.type === 'dropdown' ? (
                                <>
                                    <RecordsTouch
                                        style={{
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: recH * 0.018,
                                            flexDirection: 'row',
                                            backgroundColor: '#330F16',
                                        }}
                                        onPress={() => {
                                            setDropdownVisible(dropdownVisible ? false : true);
                                            setDropdownField(f.key);
                                        }}
                                    >
                                        <RecordsText style={{
                                            color: form[f.key] ? '#fff' : '#a88',
                                            fontSize: recW * 0.04,
                                            fontFamily: eventFontsArc.eventArcPoppinsR,
                                        }}>
                                            {form[f.key] || (f.key === 'sportType' ? 'Sport Type' : 'Primary Sport')}
                                        </RecordsText>
                                        <RecordsText style={{ color: '#fff', fontSize: recW * 0.04 }}>▼</RecordsText>
                                    </RecordsTouch>
                                    {dropdownVisible && dropdownField === f.key && (
                                        <RecordsView style={{
                                            width: '100%',
                                            borderWidth: 1,
                                            top: recH * 0.07,
                                            left: 0,
                                            borderColor: '#965A5A',
                                            zIndex: 10,
                                            maxHeight: recH * 0.4,
                                            position: 'absolute',
                                            backgroundColor: '#330F16',
                                            // paddingHorizontal: recW * 0.03,
                                        }}>
                                            <RecordsScroll>
                                                {SPORT_OPTIONS.map(opt => (
                                                    <RecordsTouch
                                                        key={opt}
                                                        style={{
                                                            paddingVertical: recH * 0.012,
                                                            borderBottomWidth: 1,
                                                            borderBottomColor: '#965A5A',
                                                        }}
                                                        onPress={() => handleDropdownSelect(opt)}
                                                    >
                                                        <RecordsText style={{
                                                            color: '#fff',
                                                            fontSize: recW * 0.04,
                                                            fontFamily: eventFontsArc.eventArcPoppinsR,
                                                            textAlign: 'center'
                                                        }}>
                                                            {opt}
                                                        </RecordsText>
                                                    </RecordsTouch>
                                                ))}
                                                <RecordsTouch
                                                    style={{
                                                        paddingVertical: recH * 0.012,
                                                    }}
                                                    onPress={() => handleDropdownSelect('Other')}
                                                >
                                                    <RecordsText style={{
                                                        color: '#fff',
                                                        fontSize: recW * 0.04,
                                                        fontFamily: eventFontsArc.eventArcPoppinsR,
                                                        textAlign: 'center'
                                                    }}>
                                                        Other
                                                    </RecordsText>
                                                </RecordsTouch>
                                            </RecordsScroll>
                                        </RecordsView>
                                    )}
                                </>
                            ) : f.type === 'attachment' && (
                                <RecordsTouch
                                    style={{
                                        alignItems: 'center',
                                        backgroundColor: '#330F16',
                                        opacity: images.length >= 4 ? 0.5 : 1,
                                        flexDirection: 'row',
                                        padding: recH * 0.018,
                                    }}
                                    onPress={handlePickImage}
                                    disabled={images.length >= 4}
                                >
                                    <RecordsText style={{ color: '#fff', flex: 1, fontSize: recW * 0.04 }}>Attachment</RecordsText>
                                    <RecordsImg
                                        source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/arcLiRecAttachment.png')}
                                        resizeMode="contain"
                                        style={{
                                            width: recW * 0.059035,
                                            height: recW * 0.059035,
                                        }}
                                    />
                                </RecordsTouch>
                            )}
                        </RecordsView>
                    ))}
                    {/* Show picked images in a grid at the bottom */}
                    {images.length > 0 && (
                        <RecordsView style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            marginTop: recH * 0.016,
                        }}>
                            {images.map((uri, idx) => (
                                <RecordsView
                                    key={uri + idx}
                                    style={{
                                        width: (recW * 0.42),
                                        backgroundColor: '#330F16',
                                        justifyContent: 'center',
                                        marginRight: (idx % 2 === 0) ? recW * 0.02 : 0,
                                        position: 'relative',
                                        height: (recW * 0.42),
                                        alignItems: 'center',
                                        marginBottom: recW * 0.02,
                                    }}
                                >
                                    <RecordsImg
                                        source={{ uri }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                        }}
                                        resizeMode="cover"
                                    />
                                    <RecordsTouch
                                        style={{
                                            backgroundColor: '#400909',
                                            position: 'absolute',
                                            right: recW * 0.019,
                                            height: recW * 0.1,
                                            width: recW * 0.1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            top: recW * 0.019,
                                        }}
                                        onPress={() => handleRemoveImage(idx)}
                                    >
                                        <RecordsText style={{
                                            color: '#fff',
                                            fontSize: recW * 0.055,
                                            fontWeight: 'bold',
                                        }}>✕</RecordsText>
                                    </RecordsTouch>
                                </RecordsView>
                            ))}
                        </RecordsView>
                    )}
                </RecordsScroll>
            </RecordsView>
        </RecordsModal>
    );
};

const EventArcArchive: React.FC = () => {
    const [activeTab, setActiveTab] = useRecordsState(0);
    const [showEntryTypeModal, setShowEntryTypeModal] = useRecordsState(false);
    const [entryType, setEntryType] = useRecordsState<string | null>(null);
    const [showDeletedModal, setShowDeletedModal] = useRecordsState(false);
    const deletedAnim = useRecordsRef(new RecordsAnim.Value(0));
    const [showSavedModal, setShowSavedModal] = useRecordsState(false);
    const savedAnim = useRecordsRef(new RecordsAnim.Value(0));
    const [search, setSearch] = useRecordsState('');

    // Entries state
    const [entries, setEntries] = useRecordsState<{ myEvents: any[], worldEvents: any[], athletes: any[] }>({
        myEvents: [],
        worldEvents: [],
        athletes: [],
    });

    // Load entries on mount and when a new entry is added
    useRecordsEffect(() => {
        const loadEntries = async () => {
            const myEventsRaw = await AsyncStorage.getItem(STORAGE_KEYS.myEvents);
            const worldEventsRaw = await AsyncStorage.getItem(STORAGE_KEYS.worldEvents);
            const athletesRaw = await AsyncStorage.getItem(STORAGE_KEYS.athletes);
            setEntries({
                myEvents: myEventsRaw ? JSON.parse(myEventsRaw) : [],
                worldEvents: worldEventsRaw ? JSON.parse(worldEventsRaw) : [],
                athletes: athletesRaw ? JSON.parse(athletesRaw) : [],
            });
        };
        loadEntries();
    }, [showEntryTypeModal, entryType]);

    // Delete entry by id and tab
    const handleDeleteEntry = async (tabIdx: number, id: string) => {
        const key = STORAGE_KEYS[Object.keys(STORAGE_KEYS)[tabIdx]];
        const raw = await AsyncStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const filtered = arr.filter((item: any) => item.id !== id);
        await AsyncStorage.setItem(key, JSON.stringify(filtered));
        setEntries((prev) => {
            const newEntries = { ...prev };
            newEntries[Object.keys(STORAGE_KEYS)[tabIdx]] = filtered;
            return newEntries;
        });
        // Show animated modal
        setShowDeletedModal(true);
        deletedAnim.current.setValue(0);
        RecordsAnim.timing(deletedAnim.current, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
        setTimeout(() => {
            RecordsAnim.timing(deletedAnim.current, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }).start(() => setShowDeletedModal(false));
        }, 1500);
    };

    // Show animated "saved" modal
    const showSaved = () => {
        setShowSavedModal(true);
        savedAnim.current.setValue(0);
        RecordsAnim.timing(savedAnim.current, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
        }).start();
        setTimeout(() => {
            RecordsAnim.timing(savedAnim.current, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }).start(() => setShowSavedModal(false));
        }, 3500);
    };

    const tabEmptyTexts = [
        'YOU HAVEN’T ADDED ANY MOMENTS YET. BEGIN WITH YOUR FIRST SPORTING MEMORY.',
        'CAPTURE THE MOMENTS THAT SHOOK STADIUMS WORLDWIDE',
        'CREATE A PROFILE FOR A CHAMPION — REAL OR YOUR OWN PERSONA',
    ];

    const renderEntries = (items: any[], leftKey: string, rightKey: string, tabIdx: number) => (
        <RecordsScroll style={{ width: recW, paddingHorizontal: recW * 0.04, marginTop: -recH * 0.01 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: recH * 0.1 }}>
            {items.map((item, idx) => (
                <RecordsTouch
                    activeOpacity={0.95}
                    key={item.id || idx}
                    onLongPress={() => {
                        RecordsAlert.alert(
                            'Delete Entry',
                            'Are you sure you want to delete this entry?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => handleDeleteEntry(tabIdx, item.id),
                                },
                            ]
                        );
                    }}
                >
                    <RecordsView
                        style={{
                            backgroundColor: '#330F16',
                            width: recW * 0.935435,
                            justifyContent: 'space-between',
                            paddingVertical: recH * 0.022,
                            marginBottom: recH * 0.018,
                            paddingHorizontal: recW * 0.04,
                            alignItems: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <RecordsText style={{
                            color: '#fff',
                            fontSize: recW * 0.045,
                            fontFamily: eventFontsArc.eventArcPoppinsR,
                            flex: 1,
                        }}>
                            {item[leftKey]}
                        </RecordsText>
                        <RecordsText style={{
                            color: '#a88',
                            fontSize: recW * 0.045,
                            fontFamily: eventFontsArc.eventArcPoppinsR,
                            textAlign: 'right',
                            flex: 1,
                        }}>
                            {item[rightKey]}
                        </RecordsText>
                    </RecordsView>
                </RecordsTouch>
            ))}
        </RecordsScroll>
    );

    const tabEntryKeys = [
        { left: 'title', right: 'date' },        // My Events
        { left: 'title', right: 'date' },        // World Events
        { left: 'name', right: 'country' },      // Athletes
    ];

    // Filter entries by search
    const getFilteredEntries = () => {
        const tabKey = activeTab === 0 ? 'myEvents' : activeTab === 1 ? 'worldEvents' : 'athletes';
        const items = entries[tabKey];
        if (!search.trim()) return items;
        const keys = Object.values(tabEntryKeys[activeTab]);
        const s = search.trim().toLowerCase();
        return items.filter((item: any) =>
            keys.some(k => (item[k] || '').toLowerCase().includes(s))
        );
    };

    return (
        <RecordsView
            style={{
                alignItems: 'center',
                flex: 1,
                width: recW,
                height: recH,
            }}
        >
            {/* Tabs */}
            <RecordsView style={{
                width: recW * 0.935435,
                flexDirection: 'row',
                marginBottom: recH * 0.022,
                marginTop: recH * 0.019,
                justifyContent: 'center',
            }}>
                {tabLabels.map((label, idx) => (
                    <RecordsTouch
                        key={label}
                        onPress={() => setActiveTab(idx)}
                        style={{
                            backgroundColor: activeTab === idx ? '#E51726' : '#330F16',
                            paddingVertical: recH * 0.014,
                            paddingHorizontal: recW * 0.045,
                            marginHorizontal: recW * 0.01,
                        }}
                    >
                        <RecordsText style={{ color: '#fff', fontWeight: 'bold', fontSize: recW * 0.04 }}>{label}</RecordsText>
                    </RecordsTouch>
                ))}
            </RecordsView>
            {/* Search Bar */}
            <RecordsView style={{
                marginBottom: recH * 0.04,
                flexDirection: 'row',
                height: recH * 0.064,
                backgroundColor: '#330F16',
                width: recW * 0.935435,
                paddingHorizontal: recW * 0.03,
                alignItems: 'center',
            }}>
                <RecordsImg
                    source={require('../EventArcLionRecordsAssets/EventArcLionRecordsImages/liArEveSearch.png')}
                    style={{ width: recW * 0.06, height: recW * 0.06, marginRight: recW * 0.03 }}
                    resizeMode="contain"
                />
                <RecordsInput
                    style={{ flex: 1, color: '#fff', fontSize: recW * 0.04, paddingVertical: recH * 0.014 }}
                    placeholder="Search ..."
                    placeholderTextColor="#a88"
                    value={search}
                    onChangeText={setSearch}
                />
            </RecordsView>
            {/* Entries */}
            <RecordsView style={{ flex: 1, width: '100%' }}>
                {renderEntries(
                    getFilteredEntries(),
                    tabEntryKeys[activeTab].left,
                    tabEntryKeys[activeTab].right,
                    activeTab
                )}
                {/* Empty State */}
                {getFilteredEntries().length === 0 && (
                    <RecordsView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, bottom: recH * 0.16 }}>
                        <RecordsText style={{
                            color: '#ccc',
                            fontSize: recW * 0.045,
                            textAlign: 'center',
                            marginBottom: recH * 0.025,
                        }}>
                            {tabEmptyTexts[activeTab]}
                        </RecordsText>
                    </RecordsView>
                )}
            </RecordsView>
            {/* New Entry Button */}
            <RecordsTouch
                style={{
                    position: 'absolute',
                    paddingVertical: recH * 0.022,
                    paddingHorizontal: recW * 0.08,
                    alignSelf: 'center',
                    bottom: recH * 0.14,
                    right: recW * 0.04,
                    backgroundColor: '#E51726',
                }}
                onPress={() => setShowEntryTypeModal(true)}
            >
                <RecordsText style={{ color: '#fff', fontSize: recW * 0.045, fontFamily: eventFontsArc.eventArcPoppinsM }}>+ NEW ENTRY</RecordsText>
            </RecordsTouch>
            {/* Blur Modal for Entry Type Selection */}
            <RecordsModal visible={showEntryTypeModal} transparent animationType="fade">
                <RecordsView style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <BlurView
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                        }}
                        blurType="dark"
                        blurAmount={8}
                        reducedTransparencyFallbackColor="rgba(40,0,0,0.7)"
                    />
                    <RecordsView style={{
                        shadowOffset: { width: 0, height: recH * 0.005 },
                        shadowOpacity: 0.7,
                        backgroundColor: '#330F16',
                        alignItems: 'center',
                        zIndex: 2,
                        shadowColor: '#000',
                        elevation: 8,
                        width: recW * 0.8,
                        padding: recH * 0.04,
                        shadowRadius: recW * 0.05,
                    }}>
                        <RecordsTouch
                            style={{ position: 'absolute', top: recH * 0.015, right: recW * 0.03 }}
                            onPress={() => setShowEntryTypeModal(false)}
                        >
                            <RecordsText style={{ color: '#fff', fontSize: recW * 0.06 }}>✕</RecordsText>
                        </RecordsTouch>
                        {ENTRY_TYPES.map((t, idx) => (
                            <RecordsTouch
                                key={t.key}
                                style={{
                                    alignItems: 'center',
                                    paddingVertical: recH * 0.022,
                                    paddingHorizontal: recW * 0.06,
                                    marginVertical: recH * 0.012,
                                    backgroundColor: '#965A5A',
                                    width: '100%',
                                }}
                                onPress={() => {
                                    setShowEntryTypeModal(false);
                                    setTimeout(() => setEntryType(t.key), 300);
                                }}
                            >
                                <RecordsText style={{ color: '#fff', fontSize: recW * 0.045, fontWeight: 'bold' }}>{t.label}</RecordsText>
                            </RecordsTouch>
                        ))}
                    </RecordsView>
                </RecordsView>
            </RecordsModal>
            {/* Entry Modal */}
            {entryType && (
                <EntryForm
                    type={entryType}
                    onClose={() => setEntryType(null)}
                    showSaved={showSaved}
                />
            )}
            {/* Animated deleted modal */}
            <RecordsModal visible={showDeletedModal} transparent animationType="none">
                <RecordsView style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.15)',
                }}>
                    <RecordsAnim.View
                        style={{
                            opacity: deletedAnim.current,
                            transform: [{
                                scale: deletedAnim.current.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.7, 1],
                                }),
                            }],
                            backgroundColor: '#330F16',
                            shadowRadius: 12,
                            paddingVertical: recH * 0.04,
                            paddingHorizontal: recW * 0.13,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            borderRadius: recW * 0.04,
                            elevation: 8,
                            shadowColor: '#000',
                        }}
                    >
                        <RecordsText style={{
                            color: '#fff',
                            fontSize: recW * 0.055,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontFamily: eventFontsArc.eventArcPoppinsSB,
                        }}>
                            SUCCESSFULLY DELETED
                        </RecordsText>
                    </RecordsAnim.View>
                </RecordsView>
            </RecordsModal>
            {/* Animated saved modal */}
            <RecordsModal visible={showSavedModal} transparent animationType="none">
                <RecordsView style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.0)',
                }}>
                    <RecordsAnim.View
                        style={{
                            opacity: savedAnim.current,
                            transform: [{
                                scale: savedAnim.current.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.7, 1],
                                }),
                            }],
                            marginBottom: recH * 0.14,
                        }}
                    >
                        <RecordsView style={{
                            position: 'relative',
                            borderRadius: recW * 0.012,
                            paddingVertical: recH * 0.032,
                            paddingHorizontal: recW * 0.06,
                            minWidth: recW * 0.7,
                            alignItems: 'center',
                            zIndex: 1000,
                            shadowRadius: 12,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 8,
                            shadowOpacity: 0.3,
                            backgroundColor: '#5ED36C',
                        }}>
                            <RecordsText style={{
                                color: '#fff',
                                fontSize: recW * 0.045,
                                fontFamily: eventFontsArc.eventArcPoppinsR,
                                textAlign: 'center',
                            }}>
                                Entry saved to your archive
                            </RecordsText>
                        </RecordsView>
                    </RecordsAnim.View>
                </RecordsView>
            </RecordsModal>
        </RecordsView>
    );
};

export default EventArcArchive;