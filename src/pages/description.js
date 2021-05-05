import { getFile, shortenText, tsv2Json } from "./../shared.js";
let previousValue = '';

export const renderDescription = (modified_at) => {
    let template = `
    <div class="main-summary-row">
            <div class="row align-left w-100 m-0">
                <h1 class="col page-header pl-0 pt-2">Learn about Confluence</h1>
                <div class="ml-auto allow-overflow mr-2" style="margin:1rem 0" id="pagesContainer"></div>
                <div class="ml-auto mt-3 mb-3" id="pageSizeContainer"></div>
            </div>
        </div>
        <div class="main-summary-row">
            <div class="col-xl-2 filter-column div-border white-bg align-left p-2">
                <div class="main-summary-row">
                    <div class="col-xl-12 pl-1 pr-0">
                        <span class="font-size-17 font-bold">Filter</span>
                        <div id="filterDataCatalogue" class="align-left"></div>
                    </div>
                </div>
            </div>
            <div class="col-xl-10 padding-right-zero font-size-16">
                <div class="main-summary-row" style="min-height: 10px;margin-bottom: 1rem;">
                    <div class="col white-bg div-border align-left font-size-17" style="padding: 0.5rem;" id="listFilters">
                        <span class="font-bold">Consortium:</span> All
                        <span class="vertical-line"></span>
                        <span class="font-bold">Study design:</span> All
                        <span class="vertical-line"></span>
                        <span class="font-bold">Country:</span> All
                    </div>
                </div>
                <div class="main-summary-row">
                    <div class="col-xl-12 pb-2 pl-0 pr-0 white-bg div-border">
                        <div class="p-2 allow-overflow" style="height: calc(100vh - 190px) !important;min-height: 500px;" id="descriptionBody"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="main-summary-row">
            <div class="offset-xl-2 col data-last-modified align-left mt-3 mb-0">
                Data last modified at - ${new Date(modified_at).toLocaleString()}
            </div>
        </div>
    `;
    document.getElementById('overview').innerHTML = template;
    getDescription();
}

const getDescription = async () => {
    const data = await getFile(761599566277);
    const json = tsv2Json(data).data;
    let newJsons = {};
    let prevAcronym = '';
    json.forEach(obj => {
        if(obj['Study Acronym'] && newJsons[`${obj['Consortium']}${obj['Study Acronym']}`] === undefined) newJsons[`${obj['Consortium']}${obj['Study Acronym']}`] = {}
        if(obj['Study Acronym']) {
            prevAcronym = `${obj['Consortium']}${obj['Study Acronym']}`;
            newJsons[`${obj['Consortium']}${obj['Study Acronym']}`] = obj;
            if(newJsons[`${obj['Consortium']}${obj['Study Acronym']}`].pis === undefined) newJsons[`${obj['Consortium']}${obj['Study Acronym']}`].pis = [];
            newJsons[`${obj['Consortium']}${obj['Study Acronym']}`].pis.push({PI: obj['PI'], PI_Email: obj['PI_Email']})
            delete newJsons[`${obj['Consortium']}${obj['Study Acronym']}`]['PI']
            delete newJsons[`${obj['Consortium']}${obj['Study Acronym']}`]['PI_Email']
        }
        else {
            newJsons[prevAcronym].pis.push({PI: obj['PI'], PI_Email: obj['PI_Email']})
        }
    });
    
    const allCountries = [];
    Object.values(newJsons).forEach(dt => {
        if(dt['Country'] === undefined) return;
        dt['Country'].split(',').forEach(ctr => {
            ctr.split(' and ').forEach(c => {
                if(c.trim()) allCountries.push(c.trim())
            });
        })
    });
    const allStudyDesigns = Object.values(newJsons).filter(dt => dt['Study design'] !== undefined).map(dt => dt['Study design']);
    const allConsortium = Object.values(newJsons).map(dt => dt['Consortium']);
    
    const countries = allCountries.filter((d,i) => allCountries.indexOf(d) === i).sort();
    const uniqueConsortium = allConsortium.filter((d,i) => allConsortium.indexOf(d.trim()) === i).sort();
    const uniqueStudyDesign = allStudyDesigns.filter((d,i) => allStudyDesigns.indexOf(d) === i).sort();
    
    let filterTemplate = `
        <div class="main-summary-row">
            <div style="width: 100%;">
                <div class="form-group" margin:0px>
                    <div id="searchContainer"></div>
                </div>
            </div>
        </div>
        <div class="main-summary-row">
            <div style="width: 100%;">
                <div class="form-group" margin:0px>
                    <label class="filter-label font-size-13" for="consortiumList">Consortium</label>
                    <ul class="remove-padding-left font-size-15 filter-sub-div allow-overflow" id="consortiumList">
                    `
                    uniqueConsortium.forEach(consortium => {
                        filterTemplate += `
                            <li class="filter-list-item">
                                <input type="checkbox" data-consortium="${consortium}" id="label${consortium}" class="select-consortium" style="margin-left: 1px !important;">
                                <label for="label${consortium}" class="country-name" title="${consortium}">${shortenText(consortium, 15)}</label>
                            </li>
                        `
                    })
        filterTemplate +=`
                    </ul>
                </div>
            </div>
        </div>
        <div class="main-summary-row">
            <div style="width: 100%;">
                <div class="form-group" margin:0px>
                    <label class="filter-label font-size-13" for="studyDesignList">Study Design</label>
                    <ul class="remove-padding-left font-size-15 filter-sub-div allow-overflow" id="studyDesignList">
                    `
                    uniqueStudyDesign.forEach(sd => {
                        filterTemplate += `
                            <li class="filter-list-item">
                                <input type="checkbox" data-study-design="${sd}" id="label${sd}" class="select-study-design" style="margin-left: 1px !important;">
                                <label for="label${sd}" class="country-name" title="${sd}">${shortenText(sd, 15)}</label>
                            </li>
                        `
                    })
        filterTemplate +=`
                    </ul>
                </div>
            </div>
        </div>
        <div class="main-summary-row">
            <div style="width: 100%;">
                <div class="form-group" margin:0px>
                    <label class="filter-label font-size-13" for="countriesList">Country</label>
                    <ul class="remove-padding-left font-size-15 filter-sub-div allow-overflow" id="countriesList">
                        `
        countries.forEach(country => {
            filterTemplate += `
                <li class="filter-list-item">
                    <input type="checkbox" data-country="${country}" id="label${country}" class="select-country" style="margin-left: 1px !important;">
                    <label for="label${country}" class="country-name" title="${country}">${shortenText(country, 15)}</label>
                </li>
            `
        })
        filterTemplate +=`
                    </ul>
                </div>
            </div>
        </div>
    `;
    document.getElementById('filterDataCatalogue').innerHTML = filterTemplate;
    const descriptions = Object.values(newJsons);
    document.getElementById('searchContainer').innerHTML = `
    <div class="input-group">
        <input type="search" class="form-control rounded" autocomplete="off" placeholder="Search min. 3 characters" aria-label="Search" id="searchDataCatalog" aria-describedby="search-addon" />
        <span class="input-group-text border-0 search-input">
            <i class="fas fa-search"></i>
        </span>
    </div>
    `;
    addEventFilterDataCatalogue(descriptions);
    renderStudyDescription(descriptions, 20);
    paginationHandler(descriptions, 20);
    document.getElementById('pageSizeContainer').innerHTML = pageSizeTemplate(descriptions, 20);
    addEventPageSizeSelection(descriptions);
};

const renderStudyDescription = (descriptions, pageSize) => {
    let template = '';
    if(descriptions.length > 0) {
        template = `
        <div class="row m-0 pt-md-1 align-left">
            <div class="col-md-2 font-bold ws-nowrap pl-2">Consortium <button class="transparent-btn sort-column" data-column-name="Consortium"><i class="fas fa-sort"></i></button></div>
            <div class="col-md-3 font-bold ws-nowrap">Study <button class="transparent-btn sort-column" data-column-name="Study"><i class="fas fa-sort"></i></button></div>
            <div class="col-md-2 font-bold ws-nowrap">Study Acronym <button class="transparent-btn sort-column" data-column-name="Study Acronym"><i class="fas fa-sort"></i></button></div>
            <div class="col-md-2 font-bold ws-nowrap">Study Design <button class="transparent-btn sort-column" data-column-name="Study design"><i class="fas fa-sort"></i></button></div>
            <div class="col-md-2 font-bold ws-nowrap">Country <button class="transparent-btn sort-column" data-column-name="Country"><i class="fas fa-sort"></i></button></div>
            <div class="col-md-1"></div>
        </div>`
        descriptions.forEach((desc, index) => {
            if(index > pageSize ) return
            template += `
            <div class="card mt-1 mb-1 align-left">
                <div style="padding: 10px" aria-expanded="false" id="heading${desc['Study Acronym'].replace(/[<b>|<\/b>]+/g, '')}">
                    <div class="row">
                        <div class="col-md-2">${desc['Consortium'] ? desc['Consortium'] : ''}</div>
                        <div class="col-md-3">${desc['Study'] ? desc['Study'] : ''}</div>
                        <div class="col-md-2">${desc['Study Acronym'] ? desc['Study Acronym'] : ''}</div>
                        <div class="col-md-2">${desc['Study design'] ? desc['Study design'] : ''}</div>
                        <div class="col-md-2">${desc['Country'] ? desc['Country'] : ''}</div>
                        <div class="col-md-1">
                            <button title="Expand/Collapse" class="transparent-btn collapse-panel-btn" data-toggle="collapse" data-target="#study${desc['Consortium'].replace(/[<b>|<\/b>]+/g, '').trim()}${desc['Study Acronym'].replace(/[<b>|<\/b>]+/g, '')}">
                                <i class="fas fa-caret-down fa-2x"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div id="study${desc['Consortium'].replace(/[<b>|<\/b>]+/g, '').trim()}${desc['Study Acronym'].replace(/[<b>|<\/b>]+/g, '')}" class="collapse" aria-labelledby="heading${desc['Study Acronym'].replace(/[<b>|<\/b>]+/g, '')}">
                    <div class="card-body" style="padding-left: 10px;background-color:#f6f6f6;">
                        ${desc['Case definition'] ? `<div class="row mb-1"><div class="col-md-2 font-bold">Case Definition</div><div class="col">${desc['Case definition']}</div></div>`: ``}
                        ${desc['Control definition'] ? `<div class="row mb-1"><div class="col-md-2 font-bold">Control Definition</div><div class="col">${desc['Control definition']}</div></div>`: ``}
                        ${desc['References'] ? `<div class="row mb-1"><div class="col-md-2 font-bold">References</div><div class="col">${desc['References']}</div></div>`: ``}
                    `
                    if(desc['pis'].length > 0) {
                        desc['pis'].forEach(info => {
                            template += `<div class="row"><div class="col-md-2 font-bold">PI</div><div class="col">${info['PI']} (<a href="mailto:${info['PI_Email']}">${info['PI_Email']}</a>)</div></div>`
                        })
                    }
                    template +=`
                    </div>
                </div>
            </div>`
        });
    }
    else {
        template += 'Data not found!'
    }
    document.getElementById('descriptionBody').innerHTML = template;
    addEventToggleCollapsePanelBtn();
    addEventSortColumn(descriptions, pageSize);
}

const addEventSortColumn = (descriptions, pageSize) => {
    const btns = document.getElementsByClassName('sort-column');
    Array.from(btns).forEach(btn => {
        btn.addEventListener('click', () => {
            const columnName = btn.dataset.columnName;
            descriptions = descriptions.sort((a, b) => (a[columnName] > b[columnName]) ? 1 : ((b[columnName] > a[columnName]) ? -1 : 0))
            renderStudyDescription(descriptions, pageSize)
        })
    })
}

const addEventFilterDataCatalogue = (descriptions) => {
    const consortiumTypeSelection = document.getElementsByClassName('select-consortium');
    Array.from(consortiumTypeSelection).forEach(ele => {
        ele.addEventListener('click', () => {
            filterDataBasedOnSelection(descriptions)
        });
    });

    const studyDesignSelection = document.getElementsByClassName('select-study-design');
    Array.from(studyDesignSelection).forEach(ele => {
        ele.addEventListener('click', () => {
            filterDataBasedOnSelection(descriptions)
        });
    });

    const countrySelection = document.getElementsByClassName('select-country');
    Array.from(countrySelection).forEach(ele => {
        ele.addEventListener('click', () => {
            filterDataBasedOnSelection(descriptions);
        });
    });
    const input = document.getElementById('searchDataCatalog');
    input.addEventListener('input', () => {
        filterDataBasedOnSelection(descriptions);
    })
}

export const addEventToggleCollapsePanelBtn = () => {
    const btns = document.getElementsByClassName('collapse-panel-btn');
    Array.from(btns).forEach(btn => {
        btn.addEventListener('click', () => {
            if(btn.querySelector('.fas.fa-2x').classList.contains('fa-caret-down')) {
                btn.querySelector('.fas.fa-2x').classList.remove('fa-caret-down')
                btn.querySelector('.fas.fa-2x').classList.add('fa-caret-up')
            }
            else {
                btn.querySelector('.fas.fa-2x').classList.remove('fa-caret-up')
                btn.querySelector('.fas.fa-2x').classList.add('fa-caret-down')
            }
        })
    })
}

const filterDataBasedOnSelection = (descriptions) => {
    const consortiumSelected = Array.from(document.getElementsByClassName('select-consortium')).filter(dt => dt.checked).map(dt => dt.dataset.consortium);
    const studyDesignSelected = Array.from(document.getElementsByClassName('select-study-design')).filter(dt => dt.checked).map(dt => dt.dataset.studyDesign);
    const countrySelected = Array.from(document.getElementsByClassName('select-country')).filter(dt => dt.checked).map(dt => dt.dataset.country);
    
    let filteredData = descriptions

    if(consortiumSelected.length > 0) {
        filteredData = filteredData.filter(dt => consortiumSelected.indexOf(dt['Consortium']) !== -1);
    }

    if(studyDesignSelected.length > 0) {
        filteredData = filteredData.filter(dt => studyDesignSelected.indexOf(dt['Study design']) !== -1);
    }
    if(countrySelected.length > 0) {
        filteredData = filteredData.filter(dt => {
            let found = false
            countrySelected.forEach(ctr => {
                if(dt['Country'] === undefined) return;
                if(found) return
                if(dt['Country'].match(new RegExp(ctr, 'ig'))) found = true;
            })
            if(found) return dt;
        });
    }

    document.getElementById('listFilters').innerHTML = `
        ${consortiumSelected.length > 0 ? `
            <span class="font-bold">Consortium: </span>${consortiumSelected[0]} ${consortiumSelected.length > 1 ? `and <span class="other-variable-count">${consortiumSelected.length-1} other</span>`: ``}
        `: `
            <span class="font-bold">Consortium:</span> All
        `}
        <span class="vertical-line"></span>
        ${studyDesignSelected.length > 0 ? `
            <span class="font-bold">Study design: </span>${studyDesignSelected[0]} ${studyDesignSelected.length > 1 ? `and <span class="other-variable-count">${studyDesignSelected.length-1} other</span>`: ``}
        `: `
            <span class="font-bold">Study design:</span> All
        `}
        <span class="vertical-line"></span>
        ${countrySelected.length > 0 ? `
            <span class="font-bold">Country: </span>${countrySelected[0]} ${countrySelected.length > 1 ? `and <span class="other-variable-count">${countrySelected.length-1} other</span>`: ``}
        `: `
            <span class="font-bold">Country:</span> All
        `}
    `
    
    if(countrySelected.length === 0 && consortiumSelected.length === 0 && studyDesignSelected.length === 0) filteredData = descriptions
    
    const input = document.getElementById('searchDataCatalog');
    const currentValue = input.value.trim().toLowerCase();
    
    if(currentValue.length <= 2 && (previousValue.length > 2 || previousValue.length === 0)) {
        document.getElementById('pageSizeContainer').innerHTML = pageSizeTemplate(filteredData, 20);
        renderStudyDescription(filteredData, document.getElementById('pageSizeSelector').value);
        paginationHandler(filteredData, document.getElementById('pageSizeSelector').value);
        addEventPageSizeSelection(filteredData);
        return;
    }
    previousValue = currentValue;
    let searchedData = JSON.parse(JSON.stringify(filteredData));
    searchedData = searchedData.filter(dt => {
        let found = false;
        if(dt['Country'] && dt['Country'].toLowerCase().includes(currentValue)) found = true;
        if(dt['Study Acronym'].toLowerCase().includes(currentValue)) found = true;
        if(dt['Study'].toLowerCase().includes(currentValue)) found = true;
        if(dt['Study design'] && dt['Study design'].toLowerCase().includes(currentValue)) found = true;
        if(found) return dt;
    })
    searchedData = searchedData.map(dt => {
        dt['Country'] = dt['Country'].replace(new RegExp(currentValue, 'gi'), '<b>$&</b>');
        dt['Study Acronym'] = dt['Study Acronym'].replace(new RegExp(currentValue, 'gi'), '<b>$&</b>');
        dt['Study design'] = dt['Study design'].replace(new RegExp(currentValue, 'gi'), '<b>$&</b>');
        dt['Study'] = dt['Study'].replace(new RegExp(currentValue, 'gi'), '<b>$&</b>');
        return dt;
    })

    document.getElementById('pageSizeContainer').innerHTML = pageSizeTemplate(searchedData, 20);
    renderStudyDescription(searchedData, document.getElementById('pageSizeSelector').value);
    paginationHandler(searchedData, document.getElementById('pageSizeSelector').value);
    addEventPageSizeSelection(searchedData);
}

const paginationHandler = (data, pageSize) => {
    const dataLength = data.length;
    const pages = Math.ceil(dataLength/pageSize);
    const array = [];

    for(let i = 0; i< pages; i++){
        array.push(i+1);
    }
    document.getElementById('pagesContainer').innerHTML = paginationTemplate(array);
    addEventPageBtns(pageSize, data);
}

export const pageSizeTemplate = (array, startPageSize) => {
    const contentSize = Math.ceil(array.length / 20) * 20;
    let pageSizes = [];
    for(let i = startPageSize; i <= contentSize; i += 20) {
        pageSizes.push(i);
    }
    let template = `
    <select class="form-control" id="pageSizeSelector">`
    pageSizes.forEach(size => {
        template += `<option value="${size}">${size}</option>`
    })
    template += `</select>
    `;
    return template;
};

const addEventPageSizeSelection = (data) => {
    const select = document.getElementById('pageSizeSelector');
    select.addEventListener('change', () => {
        const value = select.value;
        renderStudyDescription(data, value)
        paginationHandler(data, value)
    })
}

export const paginationTemplate = (array) => {
    let template = `
        <nav aria-label="Page navigation example">
            <ul class="pagination m-0">`
    
    array.forEach((a,i) => {
        if(i === 0){
            template += `<li class="page-item">
                            <button class="page-link transparent-btn" id="previousPage" data-previous="1" aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                            <span class="sr-only">Previous</span>
                            </button>
                        </li>`
        }
        template += `<li class="page-item"><button class="page-link transparent-btn ${i === 0 ? 'active-page':''}" data-page=${a}>${a}</button></li>`;

        if(i === (array.length - 1)){
            template += `
            <li class="page-item">
                <button class="page-link transparent-btn" id="nextPage" data-next="1" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                <span class="sr-only">Next</span>
                </button>
            </li>`
        }
    });
    template += `
            </ul>
        </nav>
    `;
    return template;
}

export const dataPagination = (start, end, data) => {
    const paginatedData = [];
    for(let i=start; i<end; i++){
        if(data[i]) paginatedData.push(data[i]);
    }
    return paginatedData;
}

const addEventPageBtns = (pageSize, data) => {
    const elements = document.getElementsByClassName('page-link');
    Array.from(elements).forEach(element => {
        element.addEventListener('click', () => {
            let previous = parseInt(element.dataset.previous);
            let next = parseInt(element.dataset.next);
            if(previous && !isNaN(previous) && previous === 1) previous = document.querySelectorAll('[data-page]').length + 1;
            if(next && !isNaN(next) && next === document.querySelectorAll('[data-page]').length) next = 0;
            const pageNumber = !isNaN(previous) ? previous - 1 : !isNaN(next) ? next + 1 : element.dataset.page;
            if(pageNumber < 1 || pageNumber > Math.ceil(data.length/pageSize)) return;
            
            if(!element.classList.contains('active-page')){
                let start = (pageNumber - 1) * pageSize;
                let end = pageNumber * pageSize;
                document.getElementById('previousPage').dataset.previous = pageNumber;
                document.getElementById('nextPage').dataset.next = pageNumber;
                renderStudyDescription(dataPagination(start,end,data), document.getElementById('pageSizeSelector').value);
                Array.from(elements).forEach(ele => ele.classList.remove('active-page'));
                document.querySelector(`button[data-page="${pageNumber}"]`).classList.add('active-page');
            }
        })
    });
}
