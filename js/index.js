// network service
class Network {
    /**
     *
     * @param city string
     * @returns {{name: string}} | Object
     * get weather forecast by city name
     */

    static async info(city){
        try{
            let call = null;
            if(typeof city === 'string'){
                call = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=cf29ec181705ab2b16b0972df4c16eab&units=metric`);
            }else {
                call = await fetch(` https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=cf29ec181705ab2b16b0972df4c16eab&units=metric`);
            }

            if (call && call.status === 200) {
                const data = JSON.parse(await call.text());
                if (Number(data.cod) === 200) {
                    return data;
                }
            }

            throw JSON.parse(await call.text());
        } catch(err) {
            return {
                name: err.message
            }
        }
    }

    /**
     *
     * @returns {Array<Object>}
     */
    static City() {
        return [
            {
                city: '',
                country: ''
            },
            {
                city: 'London',
                country: 'London'
            },
            {
                city: 'Yerevan',
                country: 'Yerevan'
            },
            {
                city: 'Parise',
                country: 'Parise'
            }
        ];
    }

}

// end network service

// View
class View {
    /**
     *
     * @param name string
     * @returns {Element}
     */

    selector(name){
        return document.querySelector(name);
    }

    /**
     *
     * @param name string
     * @returns {Element}
     */
    getElementById(name){
        return document.getElementById(name);
    }

    /**
     *
     * @param elem string
     * @returns {Element}
     */

    createElement(elem){
        return document.createElement(elem);
    }

    /**
     *
     * @param name string
     * @param child Element
     */

    appendChild(name, child){
        document.querySelector(name).appendChild(child)
    }

    /**
     *
     * @param city Array<Object>
     * @returns {Element}
     */
    createSelect(city){
        if (city.length) {
            city.forEach((c)=>{
                const opt = this.createElement('option');
                opt.value = c.city;
                opt.innerHTML = c.country;
                this.appendChild('select',opt)
            })
        }
        return this.selector('select');
    }

    /**
     *
     * @param name string
     */

    removeNodes(name){
        const list = document.querySelector(name);

        while (list.hasChildNodes()) {
            list.removeChild(list.firstChild);
        }
    }

    /**
     *
     * @param data string
     * @param index number
     * @returns {*}
     */

    box(data, index){
        return  `<div class="info box" id=${index}> ${data}C  <br>More Info</div>`;
    }

    /**
     *
     * @param info Object
     * @returns {*}
     */

    detailItem(info){
        return `<div style="font-size: medium; font-weight: bold; margin-bottom: 0px;">${info.City}</div><div style="float: left; width: 130px;"><div style="display:block; clear: left;"><div style="float: left;" title="Titel"><img height="45" width="45" style="border: medium none; width: 45px; height: 45px; background: url('http://openweathermap.org/img/w/${info.weather[0].icon}.png') repeat scroll 0% 0% transparent;" alt="title" src="http://openweathermap.org/images/transparent.png"></div><div style="float: left;"><div style="display: block; clear: left; font-size: medium; font-weight: bold; padding: 0pt 3pt;" title="Current Temperature">${parseInt(info.main.temp,10)}C</div> <div style="display: block; width: 85px; overflow: visible;"></div></div></div><div style="display: block; clear: left; font-size: small;">Clouds: ${info.clouds.all}%</div><div style="display: block; clear: left; color: gray; font-size: x-small;">Humidity: ${info.main.humidity}</div><div style="display: block; clear: left; color: gray; font-size: x-small;">Wind: ${info.wind.speed} m/s</div><div style="display: block; clear: left; color: gray; font-size: x-small;">Pressure: ${info.main.pressure}hpa</div></div>`
    }

}

//end View


class Weather extends View{

    constructor(){
        super();
        this.init();
        this.selectedId = null;
        this.weather ={};

        if('geolocation' in navigator){
            navigator.geolocation.getCurrentPosition((e) => this.selctWithGeolocation(e));

        }
    }

    init(){
        this.city = Network.City();
        this.createSelect(this.city).onchange =(e)=> this.selectCity(e);
    }
    async selectCity({ target }){
        if (!target.value) {
            this.removeNodes(".flex-container");
            this.cleanDetails();

            return;
        }
        let { weather } = this;
        weather = await Network.info(target.value);
        this.removeNodes(".flex-container");

        const filterByDays = [];
        if (weather.list) {
            weather.list.forEach((value) => {
                if (!filterByDays.find((i) => moment(i.dt_txt).format('MM DD') === moment(value.dt_txt).format('MM DD'))) {
                    filterByDays.push(value)
                }
            });
        }
        if (filterByDays.length) {
            filterByDays.forEach((w,i) => {
                const box = this.createElement('div');
                const dayName = this.getWeekName(w.dt_txt);
                box.onclick = (e) => this.dayClick(e);
                box.innerHTML= this.box(dayName+ " " +parseInt(w.main.temp,10), i);
                this.selector('.flex-container').appendChild(box);
            });
        }


        this.weather = { ...weather, list: filterByDays };
        this.cleanDetails();

        this.dayClick({target:{
            id: this.selectedId
        }}, true);


    }
    getWeekName(date){
        const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = moment(date).day();
        return `${weekday[day]}  ${moment(date).format('DD')}`
    }

    dayClick({ target },changeCity = false){
        let a = this.getElementById(this.selectedId);

        if(this.selectedId !== null && this.selectedId == target.id && !changeCity){
            a.setAttribute("class", "info box");
            this.selectedId = null;
            return;
        }
        if(this.selectedId !== null && this.selectedId == target.id && changeCity){
            a.setAttribute("class", "info box selected");
            this.selectedId = target.id;
        }
        if(this.selectedId !== null && this.selectedId !== target.id){
            a = this.getElementById(this.selectedId);
            a.setAttribute("class", "info box");
            a = this.getElementById(target.id);
            a.setAttribute("class", "info box selected");
        }
        this.selectedId = target.id;

        if(a === null && this.selectedId !== null){
            a = this.getElementById(this.selectedId);
            a.setAttribute("class", "info box selected");
        }

        this.details(this.weather, this.getWeekName(this.weather.dt_txt));

    }

    details(data, daysName){
        const { list, city } = data;
        const details = this.selector('.details');
        const selectedDaysInfo = list[this.selectedId];
        this.cleanDetails();

        if(this.selectedId !== null){
            const item = this.createElement('div');
            item.innerHTML= this.detailItem({...selectedDaysInfo, City: `${daysName} in  ${city.name}`});
            details.appendChild(item);
        }
    }

    cleanDetails(){
        const details = this.selector('.details');
        while (details.hasChildNodes()) {
            details.removeChild(details.firstChild);
        }
    }

    async selctWithGeolocation({ coords }){
        await this.selectCity({
            target:{
                value:{
                    lat: coords.latitude,
                    lon: coords.longitude,
                }
            }
        });
        const mySelect = this.selector('select');
        const cityName = this.weather.city.name;
        for(var i, j = 0; i = mySelect.options[j]; j++) {
            if(i.value == cityName) {
                mySelect.selectedIndex = j;
                break;
            }
        }

    }

}

const a = new Weather();
