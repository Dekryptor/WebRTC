module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    "./public/app/app.min.js": [
                        "./public/app/app.module.js",
                        "./public/app/app.routes.js",
                        "./public/app/app.controller.js",
                        "./public/app/components/*/controller.js",
                        "./public/app/services/*/service.js"
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
                    "./public/css/style.css": "./public/css/style.scss"
                }
            }
        }
    });
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.registerTask("build", ["uglify", "sass"]);
};
