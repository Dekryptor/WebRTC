module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    "./js/app.min.js": [
                        "./js/app.module.js",
                        "./js/app.routes.js",
                        "./js/app.controller.js",
                        "./js/controllers/*/controller.js",
                        "./js/services/*/service.js"
                    ]
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: "compressed"
                },
                files: {
                    "./css/style.css": "./css/style.scss"
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.registerTask("build", ["uglify", "sass"]);
};
