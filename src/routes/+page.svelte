<script>
  import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store';
  import { fly } from "svelte/transition";

  import Spotting from "./Spotting.svelte";
  import Regular from "./Regular.svelte";
  import Heavy from "./Heavy.svelte";
  import { dates } from './dates';
	
  Date.prototype.getWeek = function() {
    var dt = new Date(this.getFullYear(),0,1);
    return Math.ceil((((this - dt) / 86400000) + dt.getDay()+1)/7);
  };

  const currentDate = writable('');
  let x;
  let y;
  let todayElem;
  let showScrollToToday=false; 

  let headers = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  let now = new Date();
	let year = now.getUTCFullYear();		//	this is the month & year displayed
	let month = now.getUTCMonth();

  const rangeStart = writable(new Date(year,month,now.getUTCDate()-now.getUTCDay()-140));

  const calendar = derived(
    [dates, rangeStart],
    ([$dates, $rangeStart]) => {
      let result = [];
      // clone start date so our iterations below don't corrupt it.
      let i=new Date($rangeStart.valueOf());
      let counter = 0;
      do {
        const weekID = `${i.getFullYear()}~${i.getWeek()}`;
        let week = [];
        let j = 0;
        while(j<7){
          // increment i
          i.setDate(i.getDate()+1);

          let id = dateToString(i);

          let day = {
            id,
            name: i.getDate()==1 ? `${ monthNames[i.getUTCMonth()] } ${ i.getUTCDate() }`: i.getUTCDate(),
            isAlt: id.split('-')[1] % 2 == 0,
            isToday: id == dateToString(now)
          }

          let date = $dates[id]

          // counter and class calculation for dates
          if(date){
            day.date={type: date};
            if(counter==0){
              day.date.isStart = true;
            }
            const nextDay = new Date(i.valueOf());
            nextDay.setDate(i.getDate()+1);

            if(! $dates[dateToString(nextDay)] ){
              if(counter==0){
                day.date.isSingle = true;
              } else {
                day.date.isEnd = true;
              }
              day.date.counter = counter+1;
              counter=0;
            } else {
              if(counter==0){
                day.date.isStart = true;
              }
              counter++;
            }
          }
          week.push(day);
          j++;
        }
        result.push({ weekID, week});
      } while (i < now ) ;
      return result;
    }
  );


  function dateToString(dt) {
    if(typeof dt == 'string') dt = stringToDate(dt);
    return `${dt.getUTCFullYear()}-${dt.getUTCMonth()+1}-${dt.getUTCDate()}`;
  }

  function stringToDate(s) {
    const a = s.split('-');
    return new Date(a[0],a[1]-1,a[2],12);
  }

  function dayBefore(dt) {
    if(typeof dt == 'string') dt = stringToDate(dt);
    dt.setDate(dt.getDate()-1);
    return dateToString(dt);
  }
	
	function dayAfter(dt) {
    if(typeof dt == 'string') dt = stringToDate(dt);
    dt.setDate(dt.getDate()+1);
    return dateToString(dt);
  }

  function dayClick(day,e) {
    dates.update(d => { d[day] = "Regular"; return d; });
    x=e.pageX;
    y=e.pageY;
		currentDate.set(day);
	}

	function selectDate(d,e) {
    currentDate.set(d);
    x=e.pageX;
    y=e.pageY;
	}

  function updateDate(e,v) {
    currentDate.set('');
    dates.update(d => { d[e]=v; return d; });
	}

  function deleteDate(e) {
    currentDate.set('');
    dates.update(d => { delete d[e]; return d; });
	}

  function loadMore() {
    let i=new Date($rangeStart.valueOf());
    i.setDate($rangeStart.getDate()-28)
    $rangeStart=i;
  }

  function scrollToToday() {
		document.getElementById("today")?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
	}

	onMount(async ()=>{
    setTimeout(()=>{ 
      scrollToToday();
    }, 800 );
    
    let options = {
      rootMargin: "0px",
      threshold: 0.5,
    };

    function callback(e) {
      showScrollToToday = !e[0].isIntersecting;
    }

    let observer = new IntersectionObserver(callback, options);
    observer.observe(todayElem);
	});

</script>


<table>
  <thead>
    <tr>
      {#each headers as header}
      <th class="day-of-week">{header}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan=7 style="height: auto;"><button on:click={loadMore}>^ Go back further ^</button></td>
    </tr>
    {#each $calendar as week (week.weekID) }
      <tr id={week.weekID}>
        {#each week.week as day (day.id) }
          {#if day.isToday}
            <td 
              on:click={(e)=>dayClick(day.id,e)}
              class:alt={ day.isAlt }
              id='today'              
              bind:this={ todayElem }
              >
              <p class="day-name">
                { day.name }
              </p> 
              {#if day.date}
                <section
                  on:click={(e)=>selectDate(day.id, e)} 
                  class="date"
                  class:single={day.date.isSingle}
                  class:start={day.date.isStart}
                  class:end={day.date.isEnd}
                  >
                  {#if day.date.type=='Heavy'}
                    <Heavy />
                  {:else if day.date.type=='Spotting'}
                    <Spotting />
                  {:else}
                    <Regular />
                  {/if}
                  {#if day.date.isEnd}
                    <span>{day.date.counter}</span>
                  {/if}
                </section>
              {/if}
            </td>
          {:else}
            <td 
              on:click={(e)=>dayClick(day.id,e)}
              class:alt={ day.isAlt }
              >
              <p class="day-name">
                { day.name }
              </p> 
              {#if day.date}
                <section
                  on:click={(e)=>selectDate(day.id, e)} 
                  class="date"
                  class:single={day.date.isSingle}
                  class:start={day.date.isStart}
                  class:end={day.date.isEnd}
                  >
                  {#if day.date.type=='Heavy'}
                    <Heavy />
                  {:else if day.date.type=='Spotting'}
                    <Spotting />
                  {:else}
                    <Regular />
                  {/if}
                  {#if day.date.isEnd}
                    <span>{day.date.counter}</span>
                  {/if}
                </section>
              {/if}
            </td>
          {/if}
        {/each}
      </tr>
    {/each}
    <tr>
      <td colspan=7 class="info">
        <h2>How to Use:</h2>
        <p>
          Simply click a date. A list of buttons will appear:
        </p>
        <ul>
          <li><b>X</b> - To cancel/delete </li>
          <li><Spotting /> - Spotting</li>
          <li><Regular /> - Regular</li>
          <li><Heavy /> - Heavy</li>
        </ul>
        <p>
          Press the button which best matches your flow on that date.
        </p>
        <p>
          The list appears so that double tapping will select Regular.
        </p>

      </td>
    </tr>
  </tbody>
</table>

{#if showScrollToToday && $currentDate==''}
  <button id="scrollToToday" on:click={ scrollToToday } transition:fly="{{ y: 70, duration: 1000 }}" >
    Today
  </button>
{/if}

{#if $currentDate!='' }
<div class="mask" on:click|stopPropagation={()=>$currentDate=''}>
  <div class="modal" style="top:{y-160}px;left:{x-30}px;">
    <button on:click|stopPropagation={deleteDate($currentDate)}>X</button>
    <button on:click|stopPropagation={updateDate($currentDate, 'Spotting')}><Spotting fill="#fff"/></button>
    <button on:click|stopPropagation={updateDate($currentDate, 'Regular')}><Regular fill="#fff"/></button>
    <button on:click|stopPropagation={updateDate($currentDate, 'Heavy')}><Heavy fill="#fff" /></button>
  </div>
</div>
{/if}

<style>
  .day-of-week {
    font-size: 12px;
    text-transform: uppercase;
    color: #e9a1a7;
    text-align: center;
    border-bottom: 1px solid rgba(166, 168, 179, 0.12);
    line-height: 50px;
    font-weight: 500;
  }

  .date {
    font-size: 30px;
    padding-top: 10px;
    position: relative;
    align-self: center;
    z-index:3;
    background: #fdc5d0;
    align-self: end; 
    margin: 5px 0px;
    contain: paint;
  }

  .date.start, .date.single {
    border-left: solid 3px #fa607e;
    border-top-left-radius: 15px;
    border-bottom-left-radius: 15px;
  }

  .date.end, .date.single {  
    border-top-right-radius: 15px;
  }

  .date.single {
    border-right: solid 3px #fa607e;
    border-bottom-right-radius: 15px;
  }

  .date.end {
    border-bottom-right-radius: 7px;
  }

  .date span {
    position:fixed;
    right: 0px;
    bottom: 0px;
    font-size: 1rem;
    background-color: #fa607e;
    color: #fff;
    padding: 1px 4px 0px 4px;
    border-radius: 2rem;
    z-index: 25;
    border: solid 1px #fa5060;
  }

  button {
    width: 100%;
    height: 65px;
    appearance: button;
    background-color: #aa0000;
    background-image: linear-gradient(180deg, rgba(255, 255, 255, .15), rgba(255, 255, 255, 0));
    border: 1px solid #aa0000;
    border-radius: 0px;
    box-shadow: rgba(255, 255, 255, 0.15) 0 1px 0 inset,rgba(46, 54, 80, 0.075) 0 1px 1px;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    display: inline-block;
    font-family: Inter,sans-serif;
    font-size: 1rem;
    font-weight: 500;
    line-height: 1.5;
    margin: 0;
    padding: 1rem;
    text-align: center;
    text-transform: none;
    transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    vertical-align: middle;
  }

  .modal button:first-child {
    border-top-left-radius: 13px;
    border-top-right-radius: 13px;
  }

  .modal button:last-child {
    border-bottom-left-radius: 13px;
    border-bottom-right-radius: 13px;
  }

  table {
    width: 100%;
    height: 100%;

    table-layout: fixed;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: #fff;
  }

  th, td {
    width: 14.286%;
    vertical-align: baseline;
    padding: 0px;
  }

  td {
    height: 80px;
    border: 1px solid rgba(166, 168, 179, 0.12);
    text-align: left;
    letter-spacing: 1px;
    font-size: 14px;
    box-sizing: border-box;
    color: #eee;
    position: relative;
    background-color: #999;
  }

  td.alt {
    color: #666;
    background-color: #ccc;
  }

  td p.day-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    height: 1.2rem;
    width: 100%;
    margin: 0px 2px;
  }

  td#today {
    color: #ff0000;
    border-color: #ff0000;
    box-shadow: 2px 2px 2px #ccc;
    background-color: #fff;
  }

  td.info {
    background-color: #333;
    color: #fff;
    text-align: center;
  }

  td.info ul {
    display: flex;
    flex-direction: column;
    padding: 0;
    list-style-type: none;
    width: 160px;
    margin: 0px auto;
  }

  td.info ul li {
    display: inline-flex;
    align-items: center;
    text-align:left;
    vertical-align: middle;
  }

  td.info ul li b {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #fa607e;
    width: 20px;
    height: 30px;
  }

  :global(td.info svg) {
    width: 20px;
    fill: #fff;
  }

  button#scrollToToday {
		height: auto;
    width:auto;
		position: fixed;
		bottom: 5px;
		right: 3px;
		z-index:300;
		border-radius: 2rem;
    box-shadow: rgba(255, 255, 255, 0.15) 0 1px 0 inset,rgba(179, 168, 170, 0.75) 0 0 3px;
	}


  .mask {
    position:fixed;
    top:0px;
    bottom:0px;
    left:0px;
    right: 0px;
    background-color: rgba(166, 166, 166, 0.72);
    z-index:1000;
  }

  .modal {
    position:fixed;
    z-index:2000;
    width:60px;
  }
</style>