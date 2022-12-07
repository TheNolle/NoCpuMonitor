import { _titlebarUpdate } from './utils/titlebar.js'

const canvas = document.querySelector('canvas')
const reload = document.querySelector('button[reload]')
const timings = document.querySelector('select[timings]')
var cpus = await window.informations.cpus()
var chart = null
var lastMeasureTimes = []
var measurement = null

export async function loadMe() {
    if (localStorage.getItem('measurement')) measurement = localStorage.getItem('measurement')
    setLastMeasureTimes(cpus)
    drawChart()
    window.addEventListener('resize', _ => drawChart())
    reload.addEventListener('click', updateDatasets)
    timings.addEventListener('change', updateMeasurement)
}

function setLastMeasureTimes(cpus) {
    for (let i = 0; i < cpus.length; i++) {
        const cpu = cpus[i]
        lastMeasureTimes[i] = getData(cpu)
    }
}

function getDatasets() {
    const datasets = []
    for (let i = 0; i < cpus.length; i++) {
        const cpu = cpus[i]
        const cpuData = {
            data: getData(cpu),
            label: `Core ${i + 1}`,
            backgroundColor: [
                '#ed5ab2',
                '#5ae1ed',
                '#5ced5a'
            ]
        }
        datasets.push(cpuData)
    }
    return datasets
}

function updateDatasets() {
    for (let i = 0; i < cpus.length; i++) {
        const cpu = cpus[i]
        chart.data.datasets[i].data = getData(cpu)
        chart.data.datasets[i].data[0] -= lastMeasureTimes[i][0]
        chart.data.datasets[i].data[1] -= lastMeasureTimes[i][1]
        chart.data.datasets[i].data[2] -= lastMeasureTimes[i][2]
    }
    setLastMeasureTimes(cpus)
    drawChart()
}

function updateMeasurement() {
    measurement = timings.value
    localStorage.setItem('measurement', timings.value)
    updateDatasets()
}

function getData(cpu) {
    if (measurement) timings.value = measurement
    switch (measurement) {
        case 'milliseconds': return [cpu.times.user, cpu.times.sys, cpu.times.idle]
        case 'seconds': return [Math.round(cpu.times.user / 1000), Math.round(cpu.times.sys / 1000), Math.round(cpu.times.idle / 1000)]
        case 'minutes': return [Math.round(cpu.times.user / 1000 / 60), Math.round(cpu.times.sys / 1000 / 60), Math.round(cpu.times.idle / 1000 / 60)]
        default: {
            measurement = 'milliseconds'
            return getData(cpu)
        }
    }
}

function drawChart() {
    setTimeout(async _ => _titlebarUpdate(`${await window.informations.appName()} [${measurement}]`), 10);
    if (chart) chart.destroy()
    chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: [
                `User Time (${measurement})`,
                `System Time (${measurement})`,
                `Idle Time (${measurement})`
            ],
            datasets: getDatasets()
        },
        options: {
            animation: false,
            maintainAspectRatio: false,
            legend: {
                display: true,
                labels: {
                    fontColor: '#fafafa',
                    fontSize: 12
                }
            }
        }
    })
}