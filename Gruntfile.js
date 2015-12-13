"use strict";

module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    paths: ["./web/public/assets/style/less"],
                    yuicompress: true
                },
                files: {
                    "./web/public/assets/style/css/style.css": "./web/public/assets/style/less/style.less"
                }
            }
        },
        watch: {
            files: "./web/public/assets/style/less/**/*.less",
            tasks: ["less"]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
