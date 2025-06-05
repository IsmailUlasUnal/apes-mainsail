<template>
    <panel
        :icon="mdiChefHat"
        :title="$t('RecipeCreator.Headline')"
        :collapsible="true"
        card-class="recipe-creator-panel">
        <template #buttons>
            <v-btn v-if="recipeCommands.length > 0" color="primary" text @click="clearRecipe">
                <v-icon left small>{{ mdiDelete }}</v-icon>
                {{ $t('RecipeCreator.Clear') }}
            </v-btn>
        </template>

        <v-card-text>
            <v-row>
                <v-col cols="12" md="6">
                    <v-select
                        v-model="selectedCommandType"
                        :items="commandTypes"
                        :label="$t('RecipeCreator.SelectCommand')"
                        outlined
                        dense
                        hide-details>
                        <template #selection="{ item }">
                            <v-icon left small>{{ item.icon }}</v-icon>
                            {{ item.text }}
                        </template>
                        <template #item="{ item }">
                            <v-icon left small>{{ item.icon }}</v-icon>
                            {{ item.text }}
                        </template>
                    </v-select>
                </v-col>
                <v-col cols="12" md="6">
                    <v-btn :disabled="!selectedCommandType" color="primary" @click="showCommandDialog = true">
                        <v-icon left small>{{ mdiPlus }}</v-icon>
                        {{ $t('RecipeCreator.AddCommand') }}
                    </v-btn>
                </v-col>
            </v-row>

            <v-card v-if="recipeCommands.length > 0" class="mt-4" outlined>
                <v-card-title class="py-2">
                    <v-icon left small>{{ mdiFormatListNumbered }}</v-icon>
                    {{ $t('RecipeCreator.Recipe') }} ({{ recipeCommands.length }} {{ $t('RecipeCreator.Commands') }})
                </v-card-title>

                <draggable
                    v-model="recipeCommands"
                    handle=".drag-handle"
                    @start="drag = true"
                    @end="drag = false"
                    tag="div">
                    <v-list-item v-for="(command, index) in recipeCommands" :key="`cmd-${index}`" class="command-item">
                        <v-list-item-avatar size="32" class="drag-handle" style="cursor: move">
                            <v-icon small>{{ mdiDragVertical }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-avatar size="32">
                            <v-icon small>{{ getCommandIcon(command.type) }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title>
                                {{ formatCommandDisplay(command) }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                {{ getCommandDescription(command) }}
                            </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn icon small @click="removeCommand(index)">
                                <v-icon small>{{ mdiDelete }}</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </draggable>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="success" :loading="generating" @click="generateGCode">
                        <v-icon left small>{{ mdiFileCode }}</v-icon>
                        {{ $t('RecipeCreator.GenerateGCode') }}
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card v-else class="mt-4" outlined>
                <v-card-text class="text-center pa-8">
                    <v-icon size="64" color="grey lighten-1">{{ mdiChefHat }}</v-icon>
                    <div class="text-h6 mt-2 grey--text">
                        {{ $t('RecipeCreator.EmptyState') }}
                    </div>
                    <div class="text-body-2 grey--text">
                        {{ $t('RecipeCreator.EmptyStateDescription') }}
                    </div>
                    <v-btn color="primary" class="mt-4" @click="triggerFileUpload">
                        <v-icon left small>{{ mdiUpload }}</v-icon>
                        {{ $t('RecipeCreator.UploadRecipe') }}
                    </v-btn>
                </v-card-text>
            </v-card>

            <!-- Hidden File Input -->
            <input ref="fileInput" type="file" accept=".gcode" style="display: none" @change="handleFileUpload" />
        </v-card-text>

        <!-- Command Configuration Dialog -->
        <v-dialog v-model="showCommandDialog" max-width="500">
            <v-card>
                <v-card-title>
                    <v-icon left>{{ getCommandIcon(selectedCommandType) }}</v-icon>
                    {{ $t('RecipeCreator.Configure') }} {{ getCommandName(selectedCommandType) }}
                </v-card-title>

                <v-card-text>
                    <!-- Circle Command -->
                    <template v-if="selectedCommandType === 'circle'">
                        <v-text-field
                            v-model.number="commandParams.diameter"
                            :label="$t('RecipeCreator.Diameter') + ' (mm)'"
                            type="number"
                            min="1"
                            max="200"
                            outlined
                            dense
                            :rules="[rules.required, rules.positive]"></v-text-field>

                        <v-text-field
                            v-model.number="commandParams.duration"
                            :label="$t('RecipeCreator.Duration') + ' (s)'"
                            type="number"
                            min="1"
                            max="300"
                            outlined
                            dense
                            :rules="[rules.required, rules.positive]"></v-text-field>

                        <v-select
                            v-model="commandParams.direction"
                            :items="directionOptions"
                            :label="$t('RecipeCreator.Direction')"
                            outlined
                            dense></v-select>
                    </template>

                    <!-- Spiral Command -->
                    <template v-if="selectedCommandType === 'spiral'">
                        <v-text-field
                            v-model.number="commandParams.startDiameter"
                            :label="$t('RecipeCreator.StartDiameter') + ' (mm)'"
                            type="number"
                            min="1"
                            max="200"
                            outlined
                            dense
                            :rules="[rules.required, rules.positive]"></v-text-field>

                        <v-text-field
                            v-model.number="commandParams.endDiameter"
                            :label="$t('RecipeCreator.EndDiameter') + ' (mm)'"
                            type="number"
                            min="1"
                            max="200"
                            outlined
                            dense
                            :rules="[rules.required, rules.positive]"></v-text-field>

                        <v-text-field
                            v-model.number="commandParams.duration"
                            :label="$t('RecipeCreator.Duration') + ' (s)'"
                            type="number"
                            min="1"
                            max="300"
                            outlined
                            dense
                            :rules="[rules.required, rules.positive]"></v-text-field>

                        <v-select
                            v-model="commandParams.spiralType"
                            :items="spiralTypes"
                            :label="$t('RecipeCreator.SpiralType')"
                            outlined
                            dense></v-select>
                    </template>

                    <!-- Wait Command -->
                    <template v-if="selectedCommandType === 'wait'">
                        <v-text-field
                            v-model.number="commandParams.duration"
                            :label="$t('RecipeCreator.WaitTime') + ' (s)'"
                            type="number"
                            min="1"
                            max="600"
                            outlined
                            dense
                            :rules="[rules.required, rules.positive]"></v-text-field>

                        <v-text-field
                            v-model="commandParams.message"
                            :label="$t('RecipeCreator.Message') + ' (' + $t('RecipeCreator.Optional') + ')'"
                            outlined
                            dense
                            placeholder="Waiting..."></v-text-field>
                    </template>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="cancelCommand">
                        {{ $t('RecipeCreator.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" :disabled="!isCommandValid" @click="addCommand">
                        {{ $t('RecipeCreator.Add') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Upload Preview Dialog -->
        <v-dialog v-model="showUploadDialog" max-width="600">
            <v-card>
                <v-card-title>
                    <v-icon left color="info">{{ mdiFileImport }}</v-icon>
                    {{ $t('RecipeCreator.UploadPreview') }}
                </v-card-title>

                <v-card-text>
                    <v-alert v-if="uploadError" type="error" text dense dismissible @input="uploadError = ''">
                        {{ uploadError }}
                    </v-alert>

                    <div v-if="uploadedRecipe.length > 0">
                        <v-subheader>{{ $t('RecipeCreator.PreviewCommands') }}:</v-subheader>
                        <v-list dense max-height="300" class="overflow-y-auto">
                            <v-list-item
                                v-for="(command, index) in uploadedRecipe"
                                :key="index"
                                class="command-preview-item">
                                <v-list-item-avatar size="24">
                                    <v-icon small>{{ getCommandIcon(command.type) }}</v-icon>
                                </v-list-item-avatar>

                                <v-list-item-content>
                                    <v-list-item-title class="text-body-2">
                                        {{ formatCommandDisplay(command) }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle class="text-caption">
                                        {{ getCommandDescription(command) }}
                                    </v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </div>

                    <div v-if="uploadedFileName" class="mt-2">
                        <v-chip small color="info">
                            <v-icon left small>{{ mdiFile }}</v-icon>
                            {{ uploadedFileName }}
                        </v-chip>
                    </div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="cancelUpload">
                        {{ $t('RecipeCreator.Cancel') }}
                    </v-btn>
                    <v-btn color="primary" :disabled="uploadedRecipe.length === 0" @click="confirmUpload">
                        {{ $t('RecipeCreator.LoadRecipe') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Download Dialog -->
        <v-dialog v-model="showDownloadDialog" max-width="400">
            <v-card>
                <v-card-title>
                    <v-icon left color="success">{{ mdiDownload }}</v-icon>
                    {{ $t('RecipeCreator.DownloadReady') }}
                </v-card-title>

                <v-card-text>
                    <v-text-field
                        v-model="filename"
                        :label="$t('RecipeCreator.Filename')"
                        outlined
                        dense
                        suffix=".gcode"></v-text-field>

                    <v-alert type="info" text dense>
                        {{ $t('RecipeCreator.GCodeGenerated') }}
                    </v-alert>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text @click="showDownloadDialog = false">
                        {{ $t('RecipeCreator.Cancel') }}
                    </v-btn>
                    <v-btn color="success" @click="downloadGCode">
                        <v-icon left small>{{ mdiDownload }}</v-icon>
                        {{ $t('RecipeCreator.Download') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </panel>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import BaseMixin from '@/components/mixins/base'
import Panel from '@/components/ui/Panel.vue'
import draggable from 'vuedraggable'
import {
    mdiChefHat,
    mdiPlus,
    mdiDelete,
    mdiFormatListNumbered,
    mdiFileCode,
    mdiDownload,
    mdiUpload,
    mdiFileImport,
    mdiFile,
    mdiCircle,
    mdiClockOutline,
    mdiArrowRight,
    mdiDragVertical,
} from '@mdi/js'

interface RecipeCommand {
    type: string
    params: any
}

interface CommandParams {
    diameter?: number
    duration?: number
    direction?: string
    startDiameter?: number
    endDiameter?: number
    spiralType?: string
    message?: string
}

@Component({
    methods: {
        mdiDragVertical() {
            return mdiDragVertical
        },
    },
    components: { Panel, draggable },
})
export default class PageRecipeCreator extends Mixins(BaseMixin) {
    // Icons
    mdiChefHat = mdiChefHat
    mdiPlus = mdiPlus
    mdiDelete = mdiDelete
    mdiFormatListNumbered = mdiFormatListNumbered
    mdiFileCode = mdiFileCode
    mdiDownload = mdiDownload
    mdiUpload = mdiUpload
    mdiFileImport = mdiFileImport
    mdiFile = mdiFile
    mdiCircle = mdiCircle
    mdiSpiral = mdiCircle
    mdiClockOutline = mdiClockOutline
    mdiArrowRight = mdiArrowRight

    // Data
    selectedCommandType: string = ''
    showCommandDialog: boolean = false
    showDownloadDialog: boolean = false
    showUploadDialog: boolean = false
    generating: boolean = false
    generatedGCode: string = ''
    filename: string = 'recipe'
    uploadError: string = ''
    uploadedRecipe: RecipeCommand[] = []
    uploadedFileName: string = ''
    replaceExisting: boolean = true
    mdiDragVertical = mdiDragVertical
    drag: boolean = false

    recipeCommands: RecipeCommand[] = []
    commandParams: CommandParams = {}

    // Validation rules
    rules = {
        required: (v: any) => !!v || 'Required',
        positive: (v: number) => v > 0 || 'Must be positive',
    }

    // Computed
    get commandTypes() {
        return [
            { value: 'circle', text: this.$t('RecipeCreator.Circle'), icon: this.mdiCircle },
            { value: 'spiral', text: this.$t('RecipeCreator.Spiral'), icon: this.mdiSpiral },
            { value: 'wait', text: this.$t('RecipeCreator.Wait'), icon: this.mdiClockOutline },
        ]
    }

    get directionOptions() {
        return [
            { value: 'clockwise', text: this.$t('RecipeCreator.Clockwise') },
            { value: 'counterclockwise', text: this.$t('RecipeCreator.Counterclockwise') },
        ]
    }

    get spiralTypes() {
        return [
            { value: 'inside-out', text: this.$t('RecipeCreator.InsideOut') },
            { value: 'outside-in', text: this.$t('RecipeCreator.OutsideIn') },
        ]
    }

    get isCommandValid(): boolean {
        if (!this.selectedCommandType) return false

        switch (this.selectedCommandType) {
            case 'circle':
                return !!(
                    this.commandParams.diameter &&
                    this.commandParams.duration &&
                    this.commandParams.diameter > 0 &&
                    this.commandParams.duration > 0
                )
            case 'spiral':
                return !!(
                    this.commandParams.startDiameter &&
                    this.commandParams.endDiameter &&
                    this.commandParams.duration &&
                    this.commandParams.startDiameter > 0 &&
                    this.commandParams.endDiameter > 0 &&
                    this.commandParams.duration > 0
                )
            case 'wait':
                return !!(this.commandParams.duration && this.commandParams.duration > 0)
            default:
                return false
        }
    }

    // Methods
    getCommandIcon(type: string): string {
        const iconMap: { [key: string]: string } = {
            circle: this.mdiCircle,
            spiral: this.mdiSpiral,
            wait: this.mdiClockOutline,
        }
        return iconMap[type] || this.mdiArrowRight
    }

    getCommandName(type: string): string {
        const nameMap: { [key: string]: string } = {
            circle: 'Circle',
            spiral: 'Spiral',
            wait: 'Wait',
        }
        return nameMap[type] || type
    }

    formatCommandDisplay(command: RecipeCommand): string {
        if (command.type === 'circle') {
            const fullCircles = Math.floor(command.params.duration / 2)
            const hasPartial = command.params.duration % 2 !== 0
            const circleText = fullCircles + (hasPartial ? '.5' : '')
            return `${this.$t('RecipeCreator.Circle')} - ${command.params.diameter}mm, ${circleText} circles (${command.params.duration}s)`
        } else if (command.type === 'spiral') {
            return `${this.$t('RecipeCreator.Spiral')} - ${command.params.startDiameter}mm → ${command.params.endDiameter}mm, ${command.params.duration}s`
        } else if (command.type === 'wait') {
            return `${this.$t('RecipeCreator.Wait')} - ${command.params.duration}s`
        } else {
            return command.type
        }
    }


    getCommandDescription(command: RecipeCommand): string {
        switch (command.type) {
            case 'circle':
                return `${this.$t('RecipeCreator.Direction')}: ${this.$t('RecipeCreator.' + command.params.direction)}`
            case 'spiral':
                return `${this.$t('RecipeCreator.Type')}: ${this.$t('RecipeCreator.' + command.params.spiralType)}`
            case 'wait':
                return command.params.message || this.$t('RecipeCreator.Waiting')
            default:
                return ''
        }
    }

    resetCommandParams(): void {
        this.commandParams = {
            diameter: 10,
            duration: 5,
            direction: 'clockwise',
            startDiameter: 5,
            endDiameter: 20,
            spiralType: 'inside-out',
            message: '',
        }
    }

    addCommand(): void {
        if (!this.isCommandValid) return

        const command: RecipeCommand = {
            type: this.selectedCommandType,
            params: { ...this.commandParams },
        }

        this.recipeCommands.push(command)
        this.showCommandDialog = false
        this.resetCommandParams()
    }

    cancelCommand(): void {
        this.showCommandDialog = false
        this.resetCommandParams()
    }

    removeCommand(index: number): void {
        this.recipeCommands.splice(index, 1)
    }

    clearRecipe(): void {
        this.recipeCommands = []
    }

    generateGCode(): void {
        this.generating = true

        setTimeout(() => {
            let gcode = this.buildGCode()
            this.generatedGCode = gcode
            this.generating = false
            this.showDownloadDialog = true
        }, 1000)
    }

    buildGCode(): string {
        let gcode = [
            '; Recipe Creator G-Code',
            '; Generated by Mainsail Recipe Creator',
            `; Date: ${new Date().toISOString()}`,
            '; Commands: ' + this.recipeCommands.length,
            '',
        ]

        // Add recipe metadata as JSON comment for parsing later
        const recipeMetadata = {
            version: '1.0',
            created: new Date().toISOString(),
            commands: this.recipeCommands,
        }
        gcode.push('; RECIPE_DATA_START')
        gcode.push('; ' + JSON.stringify(recipeMetadata))
        gcode.push('; RECIPE_DATA_END')
        gcode.push('')

        gcode.push(
            ...[
                'G90 ; Absolute positioning',
                'G21 ; Set units to millimeters',
                'M83 ; Relative extruder mode',
                'G28 ; Home all axes',
                'G1 Z5 F3000 ; Raise Z slightly',
                '',
            ]
        )

        let currentX = 100 // Start position
        let currentY = 100

        for (let i = 0; i < this.recipeCommands.length; i++) {
            const command = this.recipeCommands[i]
            gcode.push(`; Command ${i + 1}: ${this.formatCommandDisplay(command)}`)

            switch (command.type) {
                case 'circle':
                    gcode.push(...this.generateCircleGCode(command.params, currentX, currentY))
                    break
                case 'spiral':
                    gcode.push(...this.generateSpiralGCode(command.params, currentX, currentY))
                    break
                case 'wait':
                    gcode.push(...this.generateWaitGCode(command.params))
                    break
            }
            gcode.push('')
        }

        gcode.push('M84 ; Disable motors')
        gcode.push('; End of recipe')

        return gcode.join('\n')
    }

    generateCircleGCode(params: any, centerX: number, centerY: number): string[] {
        const radius = params.diameter / 2
        const circleTime = 2
        const totalTime = params.duration
        const fullCircles = Math.floor(totalTime / circleTime)
        const remainingTime = totalTime % circleTime
        const partialCircleAngle = (remainingTime / circleTime) * 360 // degrees

        const feedrate = Math.round(((2 * Math.PI * radius) / circleTime) * 60) // mm/min for 2 second circles
        const direction = params.direction === 'clockwise' ? 'G02' : 'G03'
        const gcode: string[] = []

        gcode.push(`G1 X${centerX + radius} Y${centerY} F3000 ; Move to circle start`)

        for (let i = 0; i < fullCircles; i++) {
            gcode.push(`${direction} X${centerX + radius} Y${centerY} I${-radius} J0 F${feedrate} ; Circle ${i + 1}`)
        }

        if (remainingTime > 0.1) {
            const partialAngleRad = (partialCircleAngle * Math.PI) / 180
            const endX = centerX + radius * Math.cos(partialAngleRad)
            const endY = centerY + radius * Math.sin(partialAngleRad)
            const partialFeedrate = Math.round(((2 * Math.PI * radius * partialCircleAngle) / 360 / remainingTime) * 60)

            if (params.direction === 'clockwise') {
                gcode.push(
                    `G02 X${endX.toFixed(2)} Y${endY.toFixed(2)} I${-radius} J0 F${partialFeedrate} ; Partial circle`
                )
            } else {
                gcode.push(
                    `G03 X${endX.toFixed(2)} Y${endY.toFixed(2)} I${-radius} J0 F${partialFeedrate} ; Partial circle`
                )
            }
        }

        return gcode
    }
    generateSpiralGCode(params: any, centerX: number, centerY: number): string[] {
        const startRadius = params.startDiameter / 2
        const endRadius = params.endDiameter / 2
        const duration = params.duration
        const isInsideOut = params.spiralType === 'inside-out'

        const steps = 20
        const gcode: string[] = []

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps
            const currentRadius = isInsideOut
                ? startRadius + (endRadius - startRadius) * progress
                : endRadius + (startRadius - endRadius) * progress

            const angle = progress * 3 * Math.PI // 1.5 full rotations
            const x = centerX + currentRadius * Math.cos(angle)
            const y = centerY + currentRadius * Math.sin(angle)
            const feedrate = Math.round((60 / duration) * steps)

            if (i === 0) {
                gcode.push(`G1 X${x.toFixed(2)} Y${y.toFixed(2)} F3000 ; Move to spiral start`)
            } else {
                gcode.push(`G1 X${x.toFixed(2)} Y${y.toFixed(2)} F${feedrate} ; Spiral step ${i}`)
            }
        }

        return gcode
    }

    generateWaitGCode(params: any): string[] {
        const message = params.message || 'Waiting...'
        return [
            `M117 ${message} ; Display message`,
            `G4 P${params.duration * 1000} ; Wait ${params.duration} seconds`,
            'M117 ; Clear message',
        ]
    }

    downloadGCode(): void {
        const blob = new Blob([this.generatedGCode], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${this.filename}.gcode`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        this.showDownloadDialog = false
        this.$toast.success(this.$t('RecipeCreator.DownloadSuccess').toString())
    }

    // Upload Methods
    triggerFileUpload(): void {
        const fileInput = this.$refs.fileInput as HTMLInputElement
        fileInput.click()
    }

    handleFileUpload(event: Event): void {
        const target = event.target as HTMLInputElement
        const file = target.files?.[0]

        if (!file) return

        this.uploadedFileName = file.name
        this.uploadError = ''
        this.uploadedRecipe = []

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            this.parseUploadedFile(content, file.name)
        }
        reader.onerror = () => {
            this.uploadError = this.$t('RecipeCreator.FileReadError').toString()
        }
        reader.readAsText(file)
    }

    parseUploadedFile(content: string, filename: string): void {
        try {
            if (filename.endsWith('.gcode')) {
                const recipeData = this.extractRecipeFromGCode(content)
                if (recipeData.length > 0) {
                    this.uploadedRecipe = recipeData
                    this.showUploadDialog = true
                    return
                }
            }

            this.uploadError = 'Wrong formatted file uploaded. Try again.'
            this.showUploadDialog = true
        } catch (error) {
            this.uploadError = 'Wrong formatted file uploaded. Try again.'
            this.showUploadDialog = true
        }
    }

    extractRecipeFromGCode(content: string): RecipeCommand[] {
        try {
            const lines = content.split('\n')

            for (const line of lines) {
                const trimmed = line.trim()

                if (trimmed === '; RECIPE_DATA_START') {
                    continue
                }

                if (trimmed === '; RECIPE_DATA_END') {
                    break
                }
            }

            return this.parseBasicCommands(content)
        } catch (error) {
            console.warn('Failed to extract recipe data:', error)
            return []
        }
    }

    parseBasicCommands(content: string): RecipeCommand[] {
        const commands: RecipeCommand[] = []
        const lines = content.split('\n')

        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.startsWith('; Command ') && trimmed.includes(':')) {
                const commandText = trimmed.split(': ')[1]

                if (commandText.includes('Circle')) {
                    const diameterMatch = commandText.match(/(\d+(?:\.\d+)?)mm/)
                    const durationMatch = commandText.match(/(\d+(?:\.\d+)?)s/)
                    const circleMatch = commandText.match(/(\d+(?:\.\d+)?) circles/)

                    if (diameterMatch && (durationMatch || circleMatch)) {
                        let duration = 5
                        if (durationMatch) {
                            duration = parseFloat(durationMatch[1])
                        } else if (circleMatch) {
                            duration = parseFloat(circleMatch[1]) * 2
                        }

                        commands.push({
                            type: 'circle',
                            params: {
                                diameter: parseFloat(diameterMatch[1]),
                                duration: duration,
                                direction: 'clockwise'
                            }
                        })
                    }
                }
                // Try to parse wait commands
                else if (commandText.includes('Wait')) {
                    const durationMatch = commandText.match(/(\d+(?:\.\d+)?)s/)
                    if (durationMatch) {
                        commands.push({
                            type: 'wait',
                            params: {
                                duration: parseFloat(durationMatch[1]),
                                message: 'Imported wait',
                            },
                        })
                    }
                }

                // Try to parse spiral commands
                else if (commandText.includes('Spiral')) {
                    const diameterMatches = commandText.match(/(\d+(?:\.\d+)?)mm → (\d+(?:\.\d+)?)mm/)
                    const durationMatch = commandText.match(/(\d+(?:\.\d+)?)s/)

                    if (diameterMatches && durationMatch) {
                        commands.push({
                            type: 'spiral',
                            params: {
                                startDiameter: parseFloat(diameterMatches[1]),
                                endDiameter: parseFloat(diameterMatches[2]),
                                duration: parseFloat(durationMatch[1]),
                                spiralType: 'inside-out',
                            },
                        })
                    }
                }
            }
        }

        return commands
    }

    confirmUpload(): void {
        this.recipeCommands = [...this.uploadedRecipe]

        this.cancelUpload()
    }

    cancelUpload(): void {
        this.showUploadDialog = false
        this.uploadedRecipe = []
        this.uploadError = ''
        this.uploadedFileName = ''
        this.replaceExisting = true

        const fileInput = this.$refs.fileInput as HTMLInputElement
        if (fileInput) {
            fileInput.value = ''
        }
    }

    mounted(): void {
        this.resetCommandParams()
    }
}
</script>

<style scoped>

.drag-handle {
    cursor: move !important;
}

.drag-handle:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

</style>
