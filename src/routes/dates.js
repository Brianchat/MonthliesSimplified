import { writable } from 'svelte/store';
import { Preferences } from '@capacitor/preferences';

const isBrowser = typeof window !== 'undefined';

export const dates = writable({})

async function usePreferences() {
    const { value } = await Preferences.get({ key: 'dates' });
    if(value?.length>2) dates.set(JSON.parse( value ));
    dates.subscribe((value) => {
        Preferences.set({
            key: 'dates',
            value: JSON.stringify(value),
        });
    });
}

if(isBrowser) {
    if(Preferences){
        usePreferences();
    } else {
        if(localStorage.getItem('dates')) dates.set(JSON.parse( localStorage.getItem('dates') ));
        dates.subscribe((value) => localStorage.dates = JSON.stringify(value));
    }
}