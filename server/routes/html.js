var express = require("express");
var app = express.Router();
var path = require("path");

// global
// default page
app.get("/", (req, res) => {
    res.redirect(301, "/de/");
});
app.get("/cdn-cgi/l/email-protection", (req, res) => {
    res.redirect(301, "/de/");
});
app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname + "/../robots.txt"));
});
app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(__dirname + "/../sitemap.xml"));
});

// en
app.get("/en/", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/home.html"));
});
app.get("/en/clear-aligners", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/clear-aligners.html"));
});
app.get("/en/dental-treatments", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/dental-treatments.html"));
});
app.get("/en/smile-wall", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/smile-wall.html"));
});
app.get("/en/about-us/", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/about-us.html"));
});
app.get("/en/free-smile-assessment", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.query.lang)
        req.session.assessmentlang = req.query.lang
    if (req.query.source)
        req.session.assessmentsource = req.query.source
    res.sendFile(path.join(__dirname + "/../en/free-smile-assessment.html"));
});
app.get("/en/free-smile-assessment-step-1", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.query.lang)
        req.session.assessmentlang = req.query.lang
    if (req.query.source)
        req.session.assessmentsource = req.query.source
    res.sendFile(path.join(__dirname + "/../en/free-smile-assessment-step-1.html"));
});
app.get("/en/free-smile-assessment-step-2", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.session.mysqlid > 0)
        res.sendFile(path.join(__dirname + '/../en/free-smile-assessment-step-2.html'));
    else
        res.redirect(307, '/en/free-smile-assessment-step-1');
});
app.get("/en/free-smile-assessment-thank-you", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.session.mysqlid > 0)
        res.sendFile(
            path.join(__dirname + "/../en/free-smile-assessment-thank-you.html")
        );
    else
        res.redirect(301, "/en/free-smile-assessment-step-1");
});
app.get("/en/faq", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/faq.html"));
});
app.get("/en/join-us", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/join-us.html"));
});
app.get("/en/contact-us", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/contact-us.html"));
});
app.get('/en/contact-us/thank-you/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/contact-us-thank-you.html'));
})
app.get("/en/customer-reviews", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/customer-reviews.html"));
});
/*
app.get('/en/dental-treatments/dental-check-up/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-checkup.html'));
})
app.get('/en/dental-treatments/scaling-and-polishing/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-scaling.html'));
})
app.get('/en/dental-treatments/teeth-whitening/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-white.html'));
})
app.get('/en/dental-treatments/dental-crowns-and-dental-bridge/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-crowns.html'));
})
app.get('/en/dental-treatments/dental-filling/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-fill.html'));
})
app.get('/en/dental-treatments/tooth-extractions/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-extraction.html'));
})
app.get('/en/dental-treatments/root-canal-treatment/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-canal.html'));
})
app.get('/en/dental-treatments/dental-dentures/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-dentures.html'));
})
app.get('/en/dental-treatments/mouth-guard-for-bruxism/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-guard.html'));
})
app.get('/en/dental-treatments/flouride-and-fissure-treatment/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-flouride.html'));
})
app.get('/en/dental-treatments/orthodontics-treatment/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-ortho.html'));
})
app.get('/en/dental-treatments/smile-makeover/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/dental-treatments-makeover.html'));
})
*/
app.get("/en/privacy-policy", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/privacy-policy.html"));
});
app.get("/en/terms-and-conditions", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/terms-and-conditions.html"));
});
app.get("/en/refund-and-exchange-policy", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/refund-and-exchange-policy.html"));
});
app.get("/en/delivery-policy", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/delivery-policy.html"));
});
app.get("/en/referral/:kol?", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    req.session.kol = req.params.kol;
    res.sendFile(path.join(__dirname + "/../en/referral.html"));
});
app.get("/en/partner-apply", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/partner-apply.html"));
});
app.get('/en/doctors-partnership', (req, res) => {
    res.sendFile(path.join(__dirname + '/../en/doctors_partnership.html'));
})
app.get("/404", (req, res) => {
    res.sendFile(path.join(__dirname + "/../en/404.html"));
});

//de
app.get("/de/", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/home.html"));
});
app.get("/de/clear-aligners", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/clear-aligners.html"));
});
app.get("/de/dental-treatments", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/dental-treatments.html"));
});
app.get("/de/smile-wall", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/smile-wall.html"));
});
app.get("/de/about-us/", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/about-us.html"));
});
app.get("/de/free-smile-assessment", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.query.lang)
        req.session.assessmentlang = req.query.lang
    if (req.query.source)
        req.session.assessmentsource = req.query.source
    res.sendFile(path.join(__dirname + "/../de/free-smile-assessment.html"));
});
app.get("/de/free-smile-assessment-step-1", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.query.lang)
        req.session.assessmentlang = req.query.lang
    if (req.query.source)
        req.session.assessmentsource = req.query.source
    res.sendFile(path.join(__dirname + "/../de/free-smile-assessment-step-1.html"));
});
app.get("/de/free-smile-assessment-step-2", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.session.mysqlid > 0)
        res.sendFile(path.join(__dirname + '/../de/free-smile-assessment-step-2.html'));
    else
        res.redirect(307, '/de/free-smile-assessment-step-1');
});
app.get("/de/free-smile-assessment-thank-you", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    if (req.session.mysqlid > 0)
        res.sendFile(
            path.join(__dirname + "/../de/free-smile-assessment-thank-you.html")
        );
    else
        res.redirect(301, "/de/free-smile-assessment-step-1");
});
app.get("/de/faq", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/faq.html"));
});
app.get("/de/join-us", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/join-us.html"));
});
app.get("/de/contact-us", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/contact-us.html"));
});
app.get('/de/contact-us/thank-you/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/contact-us-thank-you.html'));
})
app.get("/de/customer-reviews", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/customer-reviews.html"));
});
/*
app.get('/de/dental-treatments/dental-check-up/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-checkup.html'));
})
app.get('/de/dental-treatments/scaling-and-polishing/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-scaling.html'));
})
app.get('/de/dental-treatments/teeth-whitening/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-white.html'));
})
app.get('/de/dental-treatments/dental-crowns-and-dental-bridge/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-crowns.html'));
})
app.get('/de/dental-treatments/dental-filling/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-fill.html'));
})
app.get('/de/dental-treatments/tooth-extractions/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-extraction.html'));
})
app.get('/de/dental-treatments/root-canal-treatment/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-canal.html'));
})
app.get('/de/dental-treatments/dental-dentures/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-dentures.html'));
})
app.get('/de/dental-treatments/mouth-guard-for-bruxism/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-guard.html'));
})
app.get('/de/dental-treatments/flouride-and-fissure-treatment/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-flouride.html'));
})
app.get('/de/dental-treatments/orthodontics-treatment/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-ortho.html'));
})
app.get('/de/dental-treatments/smile-makeover/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../de/dental-treatments-makeover.html'));
})
*/
app.get("/de/privacy-policy", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/privacy-policy.html"));
});
app.get("/de/terms-and-conditions", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/terms-and-conditions.html"));
});
app.get("/de/refund-and-exchange-policy", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/refund-and-exchange-policy.html"));
});
app.get("/de/delivery-policy", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/delivery-policy.html"));
});
app.get("/de/referral/:kol?", (req, res) => {
    res.set('Cache-Control', 'no-cache, max-age=0');
    req.session.kol = req.params.kol;
    res.sendFile(path.join(__dirname + "/../de/referral.html"));
});
app.get("/de/partner-apply", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/partner-apply.html"));
});
app.get("/404", (req, res) => {
    res.sendFile(path.join(__dirname + "/../de/404.html"));
});

// end
app.use('*', (req, res) => {
    // redirect to 404 in future
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    msg = `404: tried to go to ${fullUrl} \n`
    fs.appendFile('404.log', msg, function (err) {
        if (err) console.err(err)
    })
    res.status(404).redirect('/404');
})

module.exports = app;