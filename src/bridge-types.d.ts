import type { Codec, NetMDService } from './services/interfaces/netmd';

interface SpecialSettingValue{}

export interface SpecialEncoderSettingValue extends SpecialSettingValue {
    name: string,
    description: string,
    
}

export interface SpecialSetting {
    name: string;
    specialType: 'encoder';
    specialValue: SpecialSettingValue,
}

export interface NormalSetting {
    name: string;
    family: string;
    type: 'boolean' | 'string' | 'number' | 'action' | 'hostFilePath' | 'hostDirPath';
    state: boolean | string | number;
} 

export interface SettingInterface extends NormalSetting {
    update(newValue: boolean | string | number): Promise<void>;
}

export type InlineChangelogEntry = 
    | string
    | { type: 'code', content: string }
    | { type: 'link', url?: string, clickHandler?: 'openSettings', content: string }

export type ChangelogEntry = 
    | InlineChangelogEntry
    | InlineChangelogEntry[]
    | { type: 'sublist', name: string, content: ChangelogEntry[] }

export interface ChangelogVersion {
    name: string;
    contents: ChangelogEntry[]
}

export interface ChangelogVersionInjection {
    entry: ChangelogVersion;
    before: string | null;
}

declare global {
    interface Window {
        // ElectronWMD bridge
        native?: {
            // Services:
            interface?: NetMDService;
            himdFullInterface?: NetMDService;
            nwInterface?: NetMDService;

            // Optional:
            unrestrictedFetchJSON: (url: string, parameters?: any) => any;
            reload?: () => void;
            wrapperChangelog?: ChangelogVersionInjection[];

            // Settings API:
            getSettings?: () => Promise<SettingInterface[]>;
            openFileHostDialog?: (filters: { name: string, extensions: string[] }[], directory?: boolean) => Promise<string | null>;

            // Encoder settings
            invokeLocalEncoder?: (ffmpegPath: string, encoderPath: string, data: ArrayBuffer, sourceFilename: string, parameters: { format: Codec, enableReplayGain?: boolean }) => Promise<ArrayBuffer | null>;
        };

        reload: () => void;
    }
}
