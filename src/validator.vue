<template>
    <div class="cs--error-message-container relative w-full">
        <div class="absolute w-full">
            <transition name="top-slide-fade">
                <p v-if="!typing &&  Object.keys(errors).length > 0" class="cs--error-message ">
                    <span class="block leading-loose text-sm" v-for="test in errors">{{ test }}</span>
                </p>
            </transition>
        </div>
    </div>
</template>
<style lang="scss" scoped>

    .cs--error-message-container {
        bottom: 2px;
        z-index: 0;
    }

    .cs--error-message {
        @apply relative bg-certstyle-orange text-white px-4 py-1 text-xs rounded-b;
    }

    .top-slide-fade-enter, .top-slide-fade-leave-to { opacity: 0; margin-top: -20px; }
    .top-slide-fade-enter-active, .top-slide-fade-leave-active {transition: 0.3s;}

    .fade-enter-active {
        transition: opacity .5s;
    }

    .fade-leave-active {
        transition: opacity .3s;
    }

    .fade-enter {
        opacity: 0;
    }
</style>
<script>
    import collect from 'collect.js';
    import { required, minLength, maxLength, minValue, maxValue, alpha, alphaNum, numeric, integer, decimal, email, ipAddress, url, helpers  } from 'vuelidate/lib/validators';

    const postalCode = helpers.regex('alpha', /^[1-9][0-9]{3} ?(?!sa|sd|ss)[a-z]{2}$/i);
    const postalCodeExists = (param) =>
        (value) => param.includes(value.replace(' ', '').toUpperCase());

    const checkbox = value => value === true;
    const videoUrl = helpers.regex('alpha', /^(http:\/\/|https:\/\/)(vimeo\.com|youtu\.be|www\.youtube\.com)\/([\w\/]+)([\?].*)?$/igm);

    export default {
        props: ['name', 'rules', 'value', 'identifier', 'selector'],
        data() {
            return {
                inputSelector: null,
                input: null,
                innerValue: "",
                errors: {},
                innerRules: null,
                typing: true,
                types: collect({
                    required: required,
                    minLength: minLength,
                    maxLength: maxLength,
                    minValue: minValue,
                    maxValue:maxValue,
                    alpha: alpha,
                    alphaNum: alphaNum,
                    numeric: numeric,
                    integer: integer,
                    decimal: decimal,
                    email: email,
                    ipAddress: ipAddress,
                    url: url,
                    postalCode: postalCode,
                    postalCodeExists: postalCodeExists,
                    checkbox: checkbox,
                    videoUrl: videoUrl,
                }),
            }
        },

        validations() {

            let validation = {};
            validation['innerValue'] = collect({});

            let types = this.types.filter((value, type) => {
                return collect(this.innerRules).keys().contains(type);
            }).map((value, type) => {
                // if type requires params, add those params
                let rule = this.innerRules[type];
                if(rule === undefined) {
                    return value;
                }

                if(rule.rule !== undefined) {
                    return value(rule.rule);
                }

                return value;
            });

            validation['innerValue'] = validation['innerValue'].merge(types.all()).all();

            return validation;
        },

        mounted() {

            if(typeof this.rules === 'string') {
                this.innerRules = JSON.parse(this.rules);
            } else {
                this.innerRules = this.rules;
            }

            this.inputSelector = this.selector;

            if(this.inputSelector === undefined || this.inputSelector === null) {
                this.inputSelector = 'name';
            }


            this.input = document.querySelector(`[${this.inputSelector}=${this.name}]`);

            eventsHub.$on('errors:check:'+ this.identifier, this.validate);
            eventsHub.$on('custom:check:'+ this.name, this.validate);

            this.input.addEventListener("keyup", this.validateInput);
            this.input.addEventListener("blur", this.validateInput);
            this.input.addEventListener("change", this.validateInput);
        },

        destroyed() {
            this.input.removeEventListener("keyup", this.validateInput);
            this.input.removeEventListener("change", this.validateInput);
            eventsHub.$off('errors:check:'+ this.identifier, this.validate);

        },

        methods: {
            validateInput(e) {

                this.typing = true;

                this.setInnerValue(e.target);
                this.executeValidators();

                this.typing = false;
            },

            executeValidators() {

                let hasErrors = false;

                this.types.each((value, type) => {
                    if(!this.$v.innerValue[type] && this.innerRules[type] !== undefined) {
                        hasErrors = true;
                        this.errors[type] = this.innerRules[type]['message'];

                    } else if(this.innerRules[type] !== undefined) {
                        delete this.errors[type];
                    }
                });

                this.$emit('input', !hasErrors);
            },

            setInnerValue(target) {
                if(target.type === 'checkbox') {
                    this.innerValue = target.checked;
                } else {
                    this.innerValue = target.value;
                }

                this.$v.innerValue.$touch();
            },
            validate() {
                this.typing = true;

                this.setInnerValue(this.input);
                this.executeValidators();
                this.typing = false;
            }

        }
    }
</script>
