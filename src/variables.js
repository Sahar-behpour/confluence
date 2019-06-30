export const coreVariables = {
    BCAC: {
        contrType: {
            1: 'population-based',
            2: 'hospital-based',
            3: 'family-based',
            4: 'blood donor',
            5: 'nested case-control',
            6: 'BRCA1/2 carrier without bc',
            777: 'Not Applicable',
            888: "Don't Know",
            'label': 'Type of control'
        },
        status: {
            0: 'control',
            1: 'invasive case',
            2: 'in-situ case',
            3: 'case unknown invasiveness',
            9: 'excluded sample',
            'label': 'Case-control status'
        },
        matchId: {
            777: 'Not Applicable',
            888: "Don't Know",
            'label': 'ID of pair or matched case-control set'
        },
        subStudy: {
            777: 'Not Applicable',
            888: "Don't Know",
            'label': 'Identifier for within study strata (e.g. multi-ethnic cohort, different recruitement groups, or other strata)'
        },
        studyType: {
            0: 'sporadic',
            1: 'familial',
            2: 'other',
            777: 'Not Applicable',
            888: "Don't Know",
            'label': 'Identifier for within study strata: especially for identification of cohorts with familial cases'
        },
        exclusion: {
            0: 'include',
            3: 'male individual',
            4: 'gender discordance',
            5: 'no phenotypic data',
            6: 'other',
            7: 'non-breast carcinoma',
            8: 'duplicate sample',
            888: "Don't Know",
            'label': 'Reason for exclusion'
        },
        birthDate: {
            '08/08/8000': "Don't Know",
            'label': 'Date of birth '
        },
        birthDate_known: {
            'DMY': 'day,month and year known',
            'MY': 'only month and year known',
            'Y': 'only year known',
            'Not Applicable': 'all unknown',
            'label': 'Marker for date of birth'
        },
        bDay: {
            888: "Don't Know",
            'label': 'Day of birth'
        },
        bMonth: {
            888: "Don't Know",
            'label': 'Month of birth'
        },
        bYear: {
            888: "Don't Know",
            'label': 'Year of birth'
        },
        ageInt: {
            888: "Don't Know",
            'label': 'Age at interview/questionNot Applicableire for controls and cases'
        },
        intDate : {
            '08/08/8000': "Don't Know",
            'label': 'Date at interview/questionNot Applicableire for cases and controls '
        },
        refMonth: {
            888: "Don't Know",
            'label': 'Month of diagnosis of breast cancer for cases and month of completing interview/questionNot Applicableire for controls'
        },
        refYear: {
            888: "Don't Know",
            'label': 'Year of diagnosis of breast cancer for cases and year of completing interview/questionNot Applicableire for controls'
        },
        AgeDiagIndex: {
            888: "Don't Know",
            'label': 'Age at diagnosis of index breast cancer for cases'
        },
        sex: {
            M: 'male',
            F: 'female',
            U: 'unknown'
        },
        ethnicityClass: {
            1: 'European',
            2: 'Hispanic American',
            3: 'African',
            4: 'Asian Subcontinent',
            5: 'South-East Asian',
            6: 'Other',
            888: "Don't Know",
            'label': 'Ethnic origin'
        },
        ethnicitySubClass: {
            1: 'Northern European',
            2: 'Southern European',
            3: 'Western European',
            4: 'Eastern European',
            5: 'American European',
            6: 'Hispanic American',
            7: 'African (Africa)',
            8: 'Carribbean African',
            9: 'American African',
            10: 'Indian',
            11: 'Pakistani',
            12: 'East and West Bengali',
            13: 'Chinese',
            14: 'Malaysian Peninsula',
            15: 'Japanese',
            16: "Other (including 'mixed race')",
            888: "Don't Know",
            'label': 'Ethnic origin (refined)'
        },
        ethnOt: {
            777: 'Not Applicable',
            888: "Don't Know",
            'label': 'Details of specific ethnicity'
        },
        raceM: {
            1: 'European',
            2: 'Hispanic American',
            3: 'African',
            4: 'Asian Subcontinent',
            5: 'South-East Asian',
            6: "Other (including 'mixed race')",
            888: "Don't Know",
            'label': 'Race/ethnicity of mother'
        },
        raceF: {
            1: 'European',
            2: 'Hispanic American',
            3: 'African',
            4: 'Asian Subcontinent',
            5: 'South-East Asian',
            6: "Other (including 'mixed race')",
            888: "Don't Know",
            'label': 'Race/ethnicity of father'
        },
        famHist: {
            0: 'No',
            1: 'Yes',
            888: "Don't Know",
            'label': 'Family history of  breast cancer in a first degree relative (0=no, 1=yes)'
        },
        fhnumber: {
            888: "Don't Know",
            'label': 'Number of affected (breast cancer) first degree relatives'
        },
        ER_statusIndex: {
            0: 'negative',
            1: 'positive',
            888: "Don't Know",
            'label': 'Estrogen receptor status of index tumour'
        }
    }
};