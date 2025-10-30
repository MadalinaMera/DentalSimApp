//include dificultate, simptome,script pentru hardcodare
export type Difficulty = 'Ușor' | 'Mediu' | 'Dificil'

export interface SymptomMap {
    [keyword: string]: string
}

export interface PatientScenario {
    id: string
    difficulty: Difficulty
    correctDiagnosis: string
    symptoms: SymptomMap
    script: string[]
}

export const patientScenarios: PatientScenario[] = [
    {
        id: 'p1',
        difficulty: 'Ușor',
        correctDiagnosis: 'Pulpită reversibilă',
        symptoms: {
            'durere': 'E o durere ascuțită, dar trece repede când nu mai beau rece.',
            'rece': 'Da, la rece doare, apoi dispare imediat.',
            'cald': 'La cald nu simt aproape nimic.',
            'noapte': 'Nu mă trezește noaptea.',
            'umflat': 'Nu e umflat.',
            'timp': 'De vreo două zile.',
            'medicament': 'Nu am luat nimic, doar am evitat recele.',
        },
        script: [
            'Bună ziua, mă deranjează o măsea jos când beau apă rece.',
            'De două zile durează și e mai deranjant când apăs pe dinte.',
            'La cald nu prea simt nimic.',
            'După ce nu mai e rece, durerea dispare repede.'
        ],
    },
    {
        id: 'p2',
        difficulty: 'Mediu',
        correctDiagnosis: 'Parodontită cronică',
        symptoms: {
            'sângerare': 'Gingia sângerează la periaj aproape zilnic.',
            'mobilitate': 'Un dinte din față se mișcă puțin.',
            'puroi': 'Dimineața simt un gust urât, ca de puroi.',
            'igienă': 'Mă spăl o dată pe zi, nu folosesc ață.',
            'durere': 'Rareori doare, mai mult e sensibil.',
            'timp': 'De câteva luni tot persistă.',
        },
        script: [
            'Am observat că îmi sângerează gingiile des.',
            'Un dinte din față parcă se mișcă ușor.',
            'Dimineața am un gust neplăcut.',
            'Recunosc că nu folosesc ață dentară.'
        ],
    },
    {
        id: 'p3',
        difficulty: 'Dificil',
        correctDiagnosis: 'Abces periapical acut',
        symptoms: {
            'durere': 'Durerea e continuă și pulsează, mă trezește noaptea.',
            'umflare': 'Da, s-a umflat obrazul.',
            'cald': 'La cald e mai rău decât la rece.',
            'medicament': 'Am luat ibuprofen, nu prea a ajutat.',
            'ganglioni': 'Am un nodul dureros sub maxilar.',
            'timp': 'De ieri s-a agravat brusc.',
        },
        script: [
            'Mă doare tare o măsea și simt că pulsează.',
            'Astăzi mi s-a umflat obrazul.',
            'La cald e cel mai rău.',
            'Am luat ibuprofen, dar tot doare.'
        ],
    },
]
