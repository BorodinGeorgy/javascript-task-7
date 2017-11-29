'use strict';

exports.isStar = true;
exports.runParallel = runParallel;

/** Функция паралелльно запускает указанное число промисов
 * @param {Array} jobs – функции, которые возвращают промисы
 * @param {Number} parallelNum - число одновременно исполняющихся промисов
 * @param {Number} timeout - таймаут работы промиса
 * @returns {Promise}
 */
function runParallel(jobs, parallelNum, timeout = 1000) {
    let results = [];

    return new Promise(resolve => {
        if (!jobs.length) {
            resolve(results);

            return;
        }

        let jobCounter = 0;
        jobs.slice(0, parallelNum)
            .forEach(job => start(job, jobCounter++));

        function start(job, index) {
            const handle = result => handleResult(result, index);
            Promise.race([job(), new Promise(rejectJob =>
                setTimeout(rejectJob, timeout, new Error('Promise timeout')))])
                .then(handle)
                .catch(handle);
        }

        function handleResult(result, index) {
            results[index] = result;
            if (Object.keys(results).length === jobs.length) {
                resolve(results);

                return;
            }
            if (jobCounter < jobs.length) {
                start(jobs[jobCounter], jobCounter++);
            }
        }
    });
}
