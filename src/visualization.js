import { hideAnimation, getFileJSON, getFile, csvJSON, removeActiveClass, numberWithCommas, summaryStatsFileId, getFileInfo, mapReduce } from './shared.js';
import { variables } from './variables.js';
import { addEventSummaryStatsFilterForm, addEventVariableDefinitions } from './event.js';

const unique = arr => {
    let u={}
    arr.forEach(v => {
        if (v=='888' || v=='777' || v=="" ) v = undefined // 888 undefined code
        if (!u[v]) u[v] = 0
        u[v]++
    })
    return u
}

export const txt2dt = txt => {
    let dt = txt.split(/\n/g).map(tx => tx.split(/\t/g))
    // trailing blank
    if((txt.split(/\n+/).slice(-1).length == 1) && (txt.slice(-1)[0].length)){
        dt.pop()
    }
    let tab = {}
    let hh = dt[0].forEach((h,j)=>{ // headers
        tab[h] = []
        dt.slice(1).forEach((vv,i)=>{
            tab[h][i] = vv[j]
        })
    });

    let uni = {}
    Object.keys(tab).forEach(k => {
        uni[k] = unique(tab[k])
    })
    return {
        tab:tab,
        uni:uni
    }
};

export const getData = (studyEntries, studyIds, values) => {
    let allIds = {};
    studyIds.forEach(id => {
        const dataEntries = studyEntries[parseInt(id)].dataEntries;
        let selectedDataIds = [];
        values.forEach(value => {
            const selectedDataEntries = Object.keys(dataEntries).filter(key => dataEntries[key].name === value);
            if(selectedDataEntries.length > 0) selectedDataIds.push(parseInt(selectedDataEntries[0]));
        });

        selectedDataIds.forEach(dataId => {
            let fileEntries = dataEntries[dataId].fileEntries;
            // allIds = {...allIds, ...fileEntries};
        });
    });
}

export const getFileContent = async () => {
    const jsonData = csvJSON(await getFile(summaryStatsFileId)); // Get summary level data
    const lastModified = (await getFileInfo(summaryStatsFileId)).modified_at;
    document.getElementById('dataLastModified').innerHTML = `Data last modified at - ${new Date(lastModified).toLocaleString()}`;
    hideAnimation();
    if(jsonData.length === 0) {
        document.getElementById('confluenceDiv').innerHTML = `You don't have access to summary level data, please contact NCI for the access.`
        return;
    }
    renderAllCharts(jsonData, true);
};

const allFilters = (jsonData) => {
    document.getElementById('allFilters').innerHTML = '';
    const div1 = document.createElement('div')
    div1.classList = ['row gender-select'];
    let template =`
        <form method="POST" id="summaryStatsFilterForm">
            <div class="form-group">
                <label class="filter-label font-size-13" for="genderSelection">Gender</label>
                <select class="form-control font-size-15" id="genderSelection" data-variable='sex'>
                    <option selected value='all'>All</option>
                    <option value='female'>Female</option>
                    <option value='male'>Male</option>
                </select>
            </div>
            <div class="form-group">
                <label class="filter-label font-size-13" for="genotypingChipSelection">Genotyping chip</label>
                <select class="form-control font-size-15" id="genotypingChipSelection" data-variable='chip'>
                    <option selected value='all'>All Array</option>
                    <option value='Confluence chip'>Confluence Array</option>
                    <option value='Other chip'>Other Array</option>
                </select>
            </div>
    `;
    template += `<label class="filter-label font-size-13" for="studyConsortiaList">Studies</label>`
    const obj = aggegrateData(jsonData);
    for(let consortium in obj){
        let innerTemplate = `
                    <ul class="remove-padding-left font-size-15" id="studyConsortiaList">
                        <li class="custom-borders filter-list-item" style="padding-bottom: 0.125rem !important;padding-top: 0.125rem !important;">
                            <button type="button" class="consortium-selection consortium-selection-btn" data-toggle="collapse" href="#toggle${consortium.replace(/ /g, '')}">
                                <i class="fas fa-caret-down"></i>
                            </button>
                            <input type="checkbox" data-consortia="${consortium}" id="label${consortium}" class="select-consortium"/>
                            <label for="label${consortium}" class="consortia-name">${consortium}</label>
                            <div class="ml-auto">
                                <div class="filter-btn custom-margin consortia-total" data-consortia='${consortium}'>
                                    ${numberWithCommas(obj[consortium].consortiumTotal)}
                                </div>
                            </div>
                        </li>
                        <ul class="collapse no-list-style custom-padding allow-overflow" style="max-height: 250px;" id="toggle${consortium.replace(/ /g, '')}">`;
        for(let study in obj[consortium]){
            if(study !== 'consortiumTotal') {
                const total = obj[consortium][study].total;
                innerTemplate += `<li class="filter-list-item">
                                <input type="checkbox" data-study="${study}" data-consortium="${consortium}" id="label${study}" class="select-study"/>
                                <label for="label${study}" class="study-name" title="${study}">${study.length > 10 ? `${study.substr(0,10)}...`:study}</label>
                                <div class="ml-auto">
                                    <div class="filter-btn custom-margin study-total" data-consortia-study='${consortium}@#$${study}'>
                                        ${numberWithCommas(total)}
                                    </div>
                                </div>
                            </li>`;
            }
        }
        innerTemplate += `</ul></ul>`
        template += innerTemplate;
        
    }
    template += `</br><button type="submit" class="btn btn-light">Submit</button>
        <button type="reset" class="btn btn-light">Reset</button>
    </form>`;
    div1.innerHTML = template;
    document.getElementById('allFilters').appendChild(div1);
    addEventSummaryStatsFilterForm(jsonData);
    addEventConsortiumSelect();
}

const chipFilter = (jsonData) => {
    document.getElementById('chipContent').innerHTML = '';
    const div1 = document.createElement('div')
    div1.classList = ['row genotype-select'];
    div1.innerHTML = 'Genotyping chip'

    const div2 = document.createElement('div')
    div2.classList = ['row genotype-select'];

    const btn2 = document.createElement('button');
    btn2.dataset.variable = "chip";
    btn2.dataset.value = "Confluence chip";
    btn2.innerHTML = 'Confluence array'
    btn2.classList = ['filter-btn genotype-selection-btn'];
    div2.appendChild(btn2);

    const div3 = document.createElement('div')
    div3.classList = ['row genotype-select'];

    const btn3 = document.createElement('button');
    btn3.dataset.variable = "chip";
    btn3.dataset.value = "Other chip";
    btn3.innerHTML = 'Other arrays'
    btn3.classList = ['filter-btn genotype-selection-btn'];
    div3.appendChild(btn3);

    const div4 = document.createElement('div')
    div4.classList = ['row genotype-select'];

    const btn4 = document.createElement('button');
    btn4.innerHTML = 'All arrays'
    btn4.classList = ['filter-btn genotype-selection-btn genotype-active-btn'];
    div4.appendChild(btn4);

    const div5 = document.createElement('div');
    div5.classList = ['custom-hr row'];

    document.getElementById('chipContent').appendChild(div1);
    document.getElementById('chipContent').appendChild(div2);
    document.getElementById('chipContent').appendChild(div3);
    document.getElementById('chipContent').appendChild(div4);
    document.getElementById('chipContent').appendChild(div5);
    addEventGenotypeBtnSelection(jsonData, btn2);
    addEventGenotypeBtnSelection(jsonData, btn3);
    addEventGenotypeBtnSelection(jsonData, btn4);
}

const genderFilter = (jsonData) => {
    document.getElementById('genderFilter').innerHTML = '';
    const div1 = document.createElement('div')
    div1.classList = ['row gender-select'];
    div1.innerHTML = 'Gender'

    const selectDiv1 = document.createElement('div');
    selectDiv1.classList = ['row gender-select'];

    const select1 = document.createElement('select');
    select1.classList = ['form-control'];
    select1.id = 'genderSelection';
    select1.required = true;
    select1.innerHTML = `
        <option value=''> -- Select Gender -- </option>
        <option selected value='all'>All</option>
        <option value='female'>Female</option>
        <option value='male'>Male</option>
    `;

    selectDiv1.appendChild(select1);

    const div2 = document.createElement('div')
    div2.classList = ['row gender-select'];

    const btn2 = document.createElement('button');
    btn2.dataset.variable = "sex";
    btn2.dataset.value = "male";
    btn2.innerHTML = 'Male'
    btn2.classList = ['filter-btn gender-selection-btn'];
    div2.appendChild(btn2);

    const div3 = document.createElement('div')
    div3.classList = ['row gender-select'];

    const btn3 = document.createElement('button');
    btn3.dataset.variable = "sex";
    btn3.dataset.value = "female";
    btn3.innerHTML = 'Female'
    btn3.classList = ['filter-btn gender-selection-btn'];
    div3.appendChild(btn3);

    const div4 = document.createElement('div')
    div4.classList = ['row gender-select'];

    const btn4 = document.createElement('button');
    btn4.innerHTML = 'All'
    btn4.classList = ['filter-btn gender-selection-btn gender-active-btn'];
    div4.appendChild(btn4);

    const div5 = document.createElement('div');
    div5.classList = ['custom-hr row'];

    document.getElementById('genderFilter').appendChild(div1);
    document.getElementById('genderFilter').appendChild(selectDiv1);
    document.getElementById('genderFilter').appendChild(div2);
    document.getElementById('genderFilter').appendChild(div3);
    document.getElementById('genderFilter').appendChild(div4);
    document.getElementById('genderFilter').appendChild(div5);
    addEventGenderFilter(jsonData, btn2);
    addEventGenderFilter(jsonData, btn3);
    addEventGenderFilter(jsonData, btn4);
}

const aggegrateData = (jsonData) => {
    let obj = {};
    jsonData.forEach(value => {
        if(obj[value.consortium] === undefined) obj[value.consortium] = {};
        if(obj[value.consortium]){
            if(obj[value.consortium]['consortiumTotal'] === undefined) obj[value.consortium]['consortiumTotal'] = 0;
            obj[value.consortium]['consortiumTotal'] += parseInt(value.total);
            if(obj[value.consortium][value.study] === undefined) {
                obj[value.consortium][value.study] = {};
                obj[value.consortium][value.study].total= 0;
            }
            obj[value.consortium][value.study].total += parseInt(value.total);
        }
    });
    return obj;
}

const addEventGenderFilter = (jsonData, element) => {
    element.addEventListener('click', () => {
        if(element.classList.contains('gender-active-btn')) return
        removeActiveClass('gender-selection-btn', 'gender-active-btn');
        element.classList.add('gender-active-btn');
        const array = getSelectedStudies();
        const genotypeSelected = document.getElementsByClassName('genotype-active-btn')[0];
        const variable = genotypeSelected.dataset.variable;
        const variableValue = genotypeSelected.dataset.value;

        const selectedGenderElement = document.getElementsByClassName('gender-active-btn')[0];
        const variable1 = selectedGenderElement.dataset.variable;
        const variableValue1 = selectedGenderElement.dataset.value;
        let finalData = jsonData;
        if(variable1) {
            finalData = finalData.filter(dt => dt[variable1] === variableValue1);
        }
        if(variable) {
            finalData = finalData.filter(dt => dt[variable] === variableValue);
        }
        updateCounts(finalData);
        if(array.length > 0){
            finalData = finalData.filter(dt => array.indexOf(`${dt.consortium}@#$${dt.study}`) !== -1);
        }
        renderAllCharts(finalData);
    })
}

const addEventGenotypeBtnSelection = (jsonData, element) => {
    element.addEventListener('click', () => {
        if(element.classList.contains('genotype-active-btn')) return
        removeActiveClass('genotype-selection-btn', 'genotype-active-btn');
        element.classList.add('genotype-active-btn');
        const array = getSelectedStudies();
        const genotypeSelected = document.getElementsByClassName('genotype-active-btn')[0];
        const variable = genotypeSelected.dataset.variable;
        const variableValue = genotypeSelected.dataset.value;

        const selectedGenderElement = document.getElementsByClassName('gender-active-btn')[0];
        const variable1 = selectedGenderElement.dataset.variable;
        const variableValue1 = selectedGenderElement.dataset.value;
        let finalData = jsonData;
        if(variable1) {
            finalData = finalData.filter(dt => dt[variable1] === variableValue1);
        }
        if(variable) {
            finalData = finalData.filter(dt => dt[variable] === variableValue);
        }
        updateCounts(finalData);
        if(array.length > 0){
            finalData = finalData.filter(dt => array.indexOf(`${dt.consortium}@#$${dt.study}`) !== -1);
        }
        renderAllCharts(finalData);
    });
}

export const addEventConsortiumSelect = () => {
    const elements = document.getElementsByClassName('consortium-selection');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', () => {
            if (element.lastElementChild.classList.contains('fa-caret-up')){
                element.lastElementChild.classList.add('fa-caret-down');
                element.lastElementChild.classList.remove('fa-caret-up');

            } else {
                element.lastElementChild.classList.add('fa-caret-up');
                element.lastElementChild.classList.remove('fa-caret-down');
            }
        });
    });

    const consortiums = document.getElementsByClassName('select-consortium');
    Array.from(consortiums).forEach(el => {
        el.addEventListener('click', () => {
            if(el.checked){
                Array.from(el.parentNode.parentNode.querySelectorAll('.select-study')).forEach(btns => btns.checked = true);
            }
            else {
                Array.from(el.parentNode.parentNode.querySelectorAll('.select-study')).forEach(btns => btns.checked =  false);
            }
        });
    });

    const studies = document.querySelectorAll('.select-study');
    Array.from(studies).forEach(element => {
        element.addEventListener('click', () => {
            const allStudiesInConsortium = element.parentElement.parentElement.querySelectorAll('.select-study').length
            const selectedStudiesInConsortium = element.parentElement.parentElement.querySelectorAll('input:checked.select-study').length
            if(allStudiesInConsortium === selectedStudiesInConsortium) {
                element.parentElement.parentElement.parentElement.querySelector('.select-consortium').checked = true;
            }
            else {
                element.parentElement.parentElement.parentElement.querySelector('.select-consortium').checked = false;
            }
        });
    })
}

const addEventFilterCharts = (jsonData) => {
    const elements = document.getElementsByClassName('filter-studies');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', () => {
            if(element.classList.contains('active-filter')){
                element.classList.remove('active-filter');
                document.querySelectorAll(`[type="checkbox"][data-consortia="${element.dataset.consortium}"]`)[0].checked = false;
            }
            else{
                element.classList.add('active-filter');
            }
            let allStudiesSelected = true;
            const constortiaStudyElements = element.parentNode.parentNode.querySelectorAll('.filter-studies');
            Array.from(constortiaStudyElements).forEach(el => {
                if(!allStudiesSelected) return;
                if(el.classList.contains('active-filter') === false) allStudiesSelected = false;
            });
            if(allStudiesSelected) document.querySelectorAll(`[type="checkbox"][data-consortia="${element.dataset.consortium}"]`)[0].checked = true;
            const array = getSelectedStudies();
            const genotypeSelected = document.getElementsByClassName('genotype-active-btn')[0];
            const variable = genotypeSelected.dataset.variable;
            const variableValue = genotypeSelected.dataset.value;

            const selectedGenderElement = document.getElementsByClassName('gender-active-btn')[0];
            const variable1 = selectedGenderElement.dataset.variable;
            const variableValue1 = selectedGenderElement.dataset.value;
            let finalData = jsonData;
            if(variable1) {
                finalData = finalData.filter(dt => dt[variable1] === variableValue1);
            }
            if(variable) {
                finalData = finalData.filter(dt => dt[variable] === variableValue);
            }
            if(array.length > 0){
                finalData = finalData.filter(dt => array.indexOf(`${dt.consortium}@#$${dt.study}`) !== -1)
            }
            renderAllCharts(finalData);
        });
    });
};



export const renderAllCharts = (finalData, showFilter) => {
    generateBarChart('ageInt', 'dataSummaryVizChart3', 'dataSummaryVizLabel3', 'selectedRange3', 'chartDiv3', finalData);
    generateBarSingleSelect('famHist', 'dataSummaryVizChart6', 'dataSummaryVizLabel6', 'selectedRange6', 'chartDiv6', finalData)
    renderEthnicityBarChart(finalData, 'ethnicityClass', 'dataSummaryVizChart5', 'dataSummaryVizLabel5', 'selectedRange5', 'chartDiv5');
    renderPlotlyPieChart(finalData, 'ER_statusIndex', 'dataSummaryVizChart4', 'dataSummaryVizLabel4', 'selectedRange4', 'chartDiv4');
    renderStatusPieChart(finalData, 'status', 'dataSummaryVizChart2', 'dataSummaryVizLabel2', 'selectedRange2', 'chartDiv2');
    renderStudyDesignBarChart(finalData, 'studyDesign', 'dataSummaryVizChart7', 'dataSummaryVizLabel7', 'chartDiv7');
    if(showFilter) {
        allFilters(finalData);
        // chipFilter(finalData);
        // genderFilter(finalData);
        // filterByStudy(finalData);
    };
    // addEventVariableDefinitions();
}

export const updateCounts = (data) => {
    const obj = aggegrateData(data);
    for(let consortia in obj){
        const elements = document.querySelectorAll(`[data-consortia="${consortia}"]`);
        Array.from(elements).forEach(element => {
            element.innerHTML = numberWithCommas(obj[consortia].consortiumTotal);
        });
        for(let study in obj[consortia]){
            const studyElements = document.querySelectorAll(`[data-consortia-study="${consortia}@#$${study}"]`);
            Array.from(studyElements).forEach(element => {
                element.innerHTML = numberWithCommas(obj[consortia][study].total);
            });
        };
    };
}

export const getSelectedStudies = () => {
    const elements = document.querySelectorAll(`input:checked.select-study`);
    const array = [];
    Array.from(elements).forEach(element => {
        const consortium = element.dataset.consortium;
        const study = element.dataset.study;
        const value = `${consortium}@#$${study}`
        if(array.indexOf(value) === -1) array.push(value);
    })
    return array;
};

export const generateBarChart = (parameter, id, labelID, rangeLabelID, chartDiv, jsonData) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    const data = [
        {
            x: ['<20','20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99'],
            y: [ mapReduce(jsonData, '10-19'), mapReduce(jsonData, '20-29'), mapReduce(jsonData, '30-39'), mapReduce(jsonData, '40-49'), mapReduce(jsonData, '50-59'), mapReduce(jsonData, '60-69'), mapReduce(jsonData, '70-79'), mapReduce(jsonData, '80-89'), mapReduce(jsonData, '90-99') ],
            marker:{
                color: ['#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61', '#BF1B61']
            },
          type: 'bar'
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d'},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
    // document.getElementById(labelID).innerHTML = `${variables.BCAC[parameter]['label']} <button class="info-btn variable-definition" data-variable='${parameter}' data-keyboard="false" data-backdrop="static" data-toggle="modal" aria-label="More info" data-target="#confluenceMainModal"><i class="fas fa-question-circle cursor-pointer"></i></button>`;
    document.getElementById(labelID).innerHTML = `${variables.BCAC[parameter]['label']}`;
}

const generateBarSingleSelect = (parameter, id, labelID, rangeLabelID, chartDiv, jsonData) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    const data = [
        {
            x: ['Yes', 'No', 'Don\'t know'],
            y: [ mapReduce(jsonData, 'famHist_yes'), mapReduce(jsonData, 'famHist_no'), mapReduce(jsonData, 'famHist_DK') ],
            marker:{
                color: ['#BF1B61', '#f7b6d2', '#7F7F7F']
            },
          type: 'bar'
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d'},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});

    // document.getElementById(labelID).innerHTML = `${variables.BCAC[parameter]['label']} <button class="info-btn variable-definition" aria-label="More info" data-variable='${parameter}' data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#confluenceMainModal"><i class="fas fa-question-circle cursor-pointer"></i></button>`;
    document.getElementById(labelID).innerHTML = `${variables.BCAC[parameter]['label']}`;
}

const renderPlotlyPieChart = (jsonData, parameter, id, labelID, rangeLabelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    // document.getElementById(labelID).innerHTML = `${pieLabel} <button class="info-btn variable-definition" aria-label="More info" data-variable='${parameter}' data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#confluenceMainModal"><i class="fas fa-question-circle cursor-pointer"></i></button>`;
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    const values = [ mapReduce(jsonData, 'ER_statusIndex_pos'), mapReduce(jsonData, 'ER_statusIndex_neg'), mapReduce(jsonData, 'ER_statusIndex_DK') ];
    const labels = ['Positive', 'Negative', 'Don\'t know'];
    const d3 = Plotly.d3
    const format = d3.format(',3f')
    const total = values.reduce((a, b) => a + b)
    const text = values.map((v, i) => `
            ${labels[i]}<br>
            ${format(v)}<br>
            ${v / total * 100}%
        `)
    const data = [
        {
            labels,
            values,
            type: 'pie',
            textinfo: 'label+percent',
            hoverinfo: text,
            textposition: 'outside',
            automargin: true,
            showlegend: false,
            marker:{
                colors: ['#BF1B61', '#f7b6d2', '#7F7F7F']
            },
            hole: .4
        }
    ];
    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const countStatus = (value, jsonData) => {
    return jsonData.filter(dt => {if(dt.status === value) return dt}).map(dt => dt['total']).reduce((a,b) => a+b);
}

const countEthnicity = (value, jsonData) => {
    const array = jsonData.filter(dt => {if(dt.ethnicityClass === value) return dt}).map(dt => dt['total']);
    if(array.length > 0) return array.reduce((a,b) => a+b);
}

const renderStatusPieChart = (jsonData, parameter, id, labelID, rangeLabelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    // document.getElementById(labelID).innerHTML = `${pieLabel} <button class="info-btn variable-definition" aria-label="More info" data-variable='${parameter}' data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#confluenceMainModal"><i class="fas fa-question-circle cursor-pointer"></i></button>`;
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    const data = [
        {
            x: ['Case', 'Control'],
            y: [countStatus('case', jsonData), countStatus('control', jsonData)],
            type: 'bar',
            marker:{
                color: ['#BF1B61', '#f7b6d2']
            }
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d'},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const renderStudyDesignBarChart = (jsonData, parameter, id, labelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    // document.getElementById(labelID).innerHTML = `${pieLabel} <button class="info-btn variable-definition" aria-label="More info" data-variable='${parameter}' data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#confluenceMainModal"><i class="fas fa-question-circle cursor-pointer"></i></button>`;
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    
    const allLabels = getUniqueConsortium(jsonData, parameter);
    const valueCount = [];
    for(let studyDesign of allLabels){
        valueCount.push(jsonData.filter(dt => {if(dt[parameter] === studyDesign) return dt}).map(dt => dt['total']).reduce((a,b) => a+b));
    }
    
    const data = [
        {
            x: allLabels,
            y: valueCount,
            type: 'bar',
            marker:{
                color: getColors(allLabels.length)
            },
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d'},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const getUniqueConsortium = (jsonData, parameter) => {
    let array = [];
    for(let obj of jsonData){
        if(array.indexOf(obj[parameter]) === -1) array.push(obj[parameter]);
    }
    return array;
}

const renderEthnicityBarChart = (jsonData, parameter, id, labelID, rangeLabelID, chartDiv) => {
    document.getElementById(chartDiv).classList = ['background-white'];
    let pieLabel = ''
    if(variables.BCAC[parameter] && variables.BCAC[parameter]['label']){
        pieLabel = variables.BCAC[parameter]['label'];
    }else{
        pieLabel = parameter;
    }
    // document.getElementById(labelID).innerHTML = `${pieLabel} <button class="info-btn variable-definition" aria-label="More info" data-variable='${parameter}' data-keyboard="false" data-backdrop="static" data-toggle="modal" data-target="#confluenceMainModal"><i class="fas fa-question-circle cursor-pointer"></i></button>`;
    document.getElementById(labelID).innerHTML = `${pieLabel}`;
    const allLabels = getUniqueConsortium(jsonData, parameter);
    const valueCount = [];
    for(let studyDesign of allLabels){
        valueCount.push(jsonData.filter(dt => {if(dt[parameter] === studyDesign) return dt}).map(dt => dt['total']).reduce((a,b) => a+b));
    }
    const data = [
        {
            x: allLabels,
            y: valueCount,
            type: 'bar',
            marker:{
                color: ['#BF1B61', '#cb4880', '#d876a0','#e5a3bf', '#BF1B61', '#cb4880', '#7F7F7F']
            },
        }
    ];
    const layout = {
        xaxis: {fixedrange: true, automargin: true},
        yaxis: {title:`Count`, fixedrange: true, tickformat:',d'},
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
    };
    Plotly.newPlot(`${id}`, data, layout, {responsive: true, displayModeBar: false});
}

const getColors = (n) => {
    let colors = [];
    for(let i=0; i<n ; i++) {
        if(Math.abs(i % 2) == 1) colors.push('#f7b6d2');
        else colors.push('#BF1B61')
    }
    return colors;
}
