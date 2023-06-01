import {parseStringPromise, Builder} from "xml2js";
import {promisify} from "util";
import fs from "fs";
import path from "path";

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

(async () => {
    const data = await readFile(path.join(__dirname, 'input.tcx'), 'utf-8');
    const result = await parseStringPromise(data);

    const settings = result.TrainingCenterDatabase['$'];
    settings['xsi:schemaLocation'] = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd';
    settings['xmlns:ns5'] = 'http://www.garmin.com/xmlschemas/ActivityGoals/v1';
    settings['xmlns:ns3']= 'http://www.garmin.com/xmlschemas/ActivityExtension/v2';
    settings['xmlns:ns2'] = 'http://www.garmin.com/xmlschemas/UserProfile/v2';
    settings.xmlns = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';
    settings['xmlns:xsi'] = 'http://www.w3.org/2001/XMLSchema-instance';

    delete result.TrainingCenterDatabase.Activities[0]?.Activity[0]?.Creator;

    for(const activity of result.TrainingCenterDatabase.Activities) {
        for(const lap of activity.Activity[0].Lap) {
            if(!lap.DistanceMeters) {
                const trackpoints = lap.Track[0].Trackpoint;
                const lastTrackpoint = trackpoints.at(-1);
                lap.DistanceMeters = lastTrackpoint.DistanceMeters;
            }
        }
    }

    const builder = new Builder();
    var xml = builder.buildObject(result);

    await writeFile(path.join(__dirname, 'input.tcx'), xml);
})();

