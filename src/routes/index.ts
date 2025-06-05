import Dashboard from '../pages/Dashboard.vue'
import Webcam from '../pages/Webcam.vue'
import Farm from '../pages/Farm.vue'
import Files from '../pages/Files.vue'
import History from '../pages/History.vue'
import Timelapse from '../pages/Timelapse.vue'
import Machine from '../pages/Machine.vue'
import RecipeCreator from '../pages/RecipeCreator.vue'
import { AsyncComponent, Component } from 'vue'

import {
    mdiMonitorDashboard,
    mdiWebcam,
    mdiGrid,
    mdiFileDocumentMultipleOutline,
    mdiHistory,
    mdiTimelapse,
    mdiWrench,
    mdiChefHat
} from '@mdi/js'

const routes: AppRoute[] = [
    {
        name: 'dashboard',
        title: 'Dashboard',
        path: '/',
        icon: mdiMonitorDashboard,
        component: Dashboard,
        alwaysShow: true,
        showInNavi: true,
        position: 10,
    },
    {
        name: 'recipegcodecreator',
        title: 'Recipe Creator',
        path: '/recipes',
        icon: mdiChefHat,
        component: RecipeCreator,
        alwaysShow: true,
        showInNavi: true,
        position: 20,
    },

    {
        name: 'farm',
        title: 'Printers',
        path: '/allPrinters',
        component: Farm,
        alwaysShow: false,
        showInNavi: false,
    },
    {
        name: 'webcam',
        title: 'Webcam',
        path: '/cam',
        icon: mdiWebcam,
        component: Webcam,
        alwaysShow: true,
        showInNavi: true,
        position: 20,
        fullscreen: true,
    },
    {
        name: 'heightmap',
        title: 'Heightmap',
        path: '/heightmap',
        icon: mdiGrid,
        component: () => import('../pages/Heightmap.vue'),
        alwaysShow: false,
        showInNavi: true,
        klipperComponent: 'bed_mesh',
        position: 40,
    },
    {
        name: 'gcodefiles',
        title: 'G-Code Files',
        path: '/files',
        icon: mdiFileDocumentMultipleOutline,
        component: Files,
        alwaysShow: true,
        showInNavi: true,
        registeredDirectory: 'gcodes',
        position: 50,
        fullscreen: true,
    },
    {
        name: 'history',
        title: 'History',
        path: '/history',
        icon: mdiHistory,
        component: History,
        alwaysShow: true,
        showInNavi: true,
        moonrakerComponent: 'history',
        position: 70,
    },
    {
        name: 'timelapse',
        title: 'Timelapse',
        path: '/timelapse',
        icon: mdiTimelapse,
        component: Timelapse,
        alwaysShow: true,
        showInNavi: true,
        moonrakerComponent: 'timelapse',
        position: 80,
    },
    {
        name: 'machine',
        title: 'Machine',
        path: '/config',
        icon: mdiWrench,
        component: Machine,
        alwaysShow: true,
        showInNavi: true,
        position: 90,
    },
    {
        title: null,
        component: null,
        alwaysShow: false,
        showInNavi: false,
        path: '/settings/machine',
        redirect: '/config',
    },
]

export default routes

export interface AppRoute {
    name?: string
    title: string | null
    path: string
    redirect?: string
    icon?: string
    component: Component | AsyncComponent | null
    alwaysShow: boolean
    showInNavi: boolean
    registeredDirectory?: string
    moonrakerComponent?: string
    klipperComponent?: string
    klipperIsConnected?: boolean
    children?: AppRoute[]
    position?: number
    fullscreen?: boolean
}
