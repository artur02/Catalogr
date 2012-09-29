/*globals define, require, WinJS*/
define(["External/jsSha2/sha2"], function() {
    "use strict";

    var accessKeyId,
        secretAccessKey;

    function loadKeys() {
        return new WinJS.Promise(function(comp, err, prog) {
            var foldername = "NoUpload";
            var filename = "amazon.xml";

            // Open folder.
            Windows.ApplicationModel.Package.current.installedLocation.getFolderAsync(foldername)
                .done(function (folder) {
                    // Open file
                    folder.getFileAsync(filename).done(function(file) {

                        // Prepare load settings.
                        var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings();
                        loadSettings.prohibitDtd = false;
                        loadSettings.resolveExternals = false;

                        // Load XML - Important: We do this before opening the transaction to talk to the database, 
                        // so the transaction won't expire.
                        Windows.Data.Xml.Dom.XmlDocument.loadFromFileAsync(file, loadSettings).done(function(xmlDoc) {
                            // Load the books
                            var accessKeyIdNode = xmlDoc.selectSingleNode('//accessKeyId');
                            var secretAccessKeyNode = xmlDoc.selectSingleNode('//secretAccessKey');

                            accessKeyId = accessKeyIdNode.innerText;
                            secretAccessKey = secretAccessKeyNode.innerText;

                            comp();
                        });
                    });
                });
        });
    }

    function getSignature(url) {
        var unsignedUrl = url;
        var lines = unsignedUrl.split("\n");
        unsignedUrl = "";
        lines.forEach(function(line) {
            unsignedUrl += line;
        });

        // find host and query portions
        var urlregex = new RegExp("^http:\\/\\/(.*)\\/onca\\/xml\\?(.*)$");
        var matches = urlregex.exec(unsignedUrl);

        if (matches === null) {
            throw new URIError("Could not find PA-API end-point in the URL. Please ensure the URL looks like the example provided.");
        }

        var host = matches[1].toLowerCase();
        var query = matches[2];

        // split the query into its constituent parts
        var pairs = query.split("&");

        // remove signature if already there
        // remove access key id if already present 
        //  and replace with the one user provided above
        // add timestamp if not already present
        pairs = cleanupRequest(pairs);
        // encode the name and value in each pair
        pairs = encodeNameValuePairs(pairs);

        // sort them and put them back together to get the canonical query string
        pairs.sort();

        var canonicalQuery = pairs.join("&");
        var stringToSign = "GET\n" + host + "\n/onca/xml\n" + canonicalQuery;

        // calculate the signature
        var secret = getSecretAccessKey();
        var signature = sign(secret, stringToSign);
        // assemble the signed url
        var signedUrl = "http://" + host + "/onca/xml?" + canonicalQuery + "&Signature=" + signature;

        return signedUrl;
    }

    function encodeNameValuePairs(pairs) {
        pairs.forEach(function (pair, i) {
            var name = "";
            var value = "";
            var index = pair.indexOf("=");

            // take care of special cases like "&foo&", "&foo=&" and "&=foo&" 
            if (index === -1) {
                name = pair;
            } else if (index === 0) {
                value = pair;
            } else {
                name = pair.substring(0, index);
                if (index < pair.length - 1) {
                    value = pair.substring(index + 1);
                }
            }
            // decode and encode to make sure we undo any incorrect encoding
            name = encodeURIComponent(decodeURIComponent(name));

            value = value.replace(/\+/g, "%20");
            value = encodeURIComponent(decodeURIComponent(value));

            pairs[i] = name + "=" + value;
        });

        return pairs;
    }

    function cleanupRequest(pairs) {
        var haveTimestamp = false;
        var haveAwsId = false;
        var accessKeyId = getAccessKeyId();

        var nPairs = pairs.length;
        var i = 0;
        while (i < nPairs) {
            var p = pairs[i];
            if (p.search(/^Timestamp=/) !== -1) {
                haveTimestamp = true;
            } else if (p.search(/^(AWSAccessKeyId|SubscriptionId)=/) !== -1) {
                pairs.splice(i, 1, "AWSAccessKeyId=" + accessKeyId);
                haveAwsId = true;
            } else if (p.search(/^Signature=/) !== -1) {
                pairs.splice(i, 1);
                i--;
                nPairs--;
            }
            i++;
        }

        if (!haveTimestamp) {
            pairs.push("Timestamp=" + getNowTimeStamp());
        }

        if (!haveAwsId) {
            pairs.push("AWSAccessKeyId=" + accessKeyId);
        }
        return pairs;
    }

    function sign(secret, message) {
        var messageBytes = str2binb(message);
        var secretBytes = str2binb(secret);

        if (secretBytes.length > 16) {
            secretBytes = core_sha256(secretBytes, secret.length * chrsz);
        }

        var ipad = new Array(16), opad = new Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = secretBytes[i] ^ 0x36363636;
            opad[i] = secretBytes[i] ^ 0x5C5C5C5C;
        }

        var imsg = ipad.concat(messageBytes);
        var ihash = core_sha256(imsg, 512 + message.length * chrsz);
        var omsg = opad.concat(ihash);
        var ohash = core_sha256(omsg, 512 + 256);

        var b64hash = binb2b64(ohash);
        var urlhash = encodeURIComponent(b64hash);

        return urlhash;
    }


    function getNowTimeStamp() {
        var time = new Date();
        return time.toISOString();
    }

    function getAccessKeyId() {
        return accessKeyId;
    }

    function getSecretAccessKey() {
        return secretAccessKey;
    }

    function BookSearch() {
        //http://ecs.amazonaws.co.uk/onca/xml?
        //Service=AWSECommerceService
        //    &AWSAccessKeyId=AKIAJOHMUMYIJ43O4DJQ
        //        &Operation=ItemSearch
        //            &Actor=Johnny%20Depp
        //                &ResponseGroup=ItemAttributes,Offers,Images,Reviews,Variations
        //                    &SearchIndex=DVD
        //                        &Sort=salesrank
        //                            &AssociateTag=mytag-20

        function buildUrl(params) {
            var domain = "ecs.amazonaws.co.uk/onca/xml?",
                parameters = [];


            params.Service = 'AWSECommerceService';
            params.AWSAccessKeyId = getAccessKeyId();
            params.Operation = 'ItemSearch';
            params.SearchIndex = 'Books';
            params.AssociateTag = 'mytag-20';

            var paramKeys = Object.keys(params);
            paramKeys.forEach(function(key) {
                var param = key + "=" + params[key];
                parameters.push(param);
            });

            var url = "http://" + domain + parameters.join('&');
            return url;
        }
            
        function Image(node) {
            this.url = node.getElementsByTagName("URL")[0].innerText;
            this.width = node.getElementsByTagName("Width")[0].innerText;
            this.height = node.getElementsByTagName("Height")[0].innerText;
        }

        function Item(node) {
            function getImages(node) {
                var small = node.getElementsByTagName("SmallImage");
                var medium = node.getElementsByTagName("MediumImage");
                var large = node.getElementsByTagName("LargeImage");

                var smallImages = small.map(function (imageNode) {
                    return new Image(imageNode);
                });

                var mediumImages = medium.map(function (imageNode) {
                    return new Image(imageNode);
                });

                var largeImages = large.map(function (imageNode) {
                    return new Image(imageNode);
                });

                function getLargest() {
                    if(largeImages) {
                        return largeImages;
                    } else if (mediumImages) {
                        return mediumImages;
                    } else {
                        return smallImages;
                    }
                }

                return {
                    small: smallImages,
                    medium: mediumImages,
                    large: largeImages,

                    getLargest: getLargest
                };
            }

            var publishers = node.getElementsByTagName("Publisher"),
                eans = node.getElementsByTagName("EAN"),
                isbns = node.getElementsByTagName("ISBN");

            this.author = node.getElementsByTagName("Author")[0].innerText;
            this.numberOfPages = node.getElementsByTagName("NumberOfPages")[0].innerText;
            this.title = node.getElementsByTagName("Title")[0].innerText;
            this.publisher = publishers.length > 0 ?  publishers[0].innerText : undefined;
            this.EAN = eans.length > 0 ? eans[0].innerText : undefined;
            this.ISBN = isbns.length > 0 ? isbns[0].innerText : undefined;
            this.ASIN = node.getElementsByTagName("ASIN")[0].innerText;
            this.providerUrl = node.getElementsByTagName("DetailPageURL")[0].innerText;
            this.publicationDate = node.getElementsByTagName("PublicationDate")[0].innerText;
            this.images = getImages(node);
        }

        function Response(node) {
            function getItems(node) {
                var itemNodes = node.getElementsByTagName("Item");
                var items = itemNodes.map(function (itemNode) {
                    return new Item(itemNode);
                });

                return items;
            }

            this.items = getItems(node);
            this.moreResultsUrl = node.getElementsByTagName("MoreSearchResultsUrl")[0].innerText;
            this.totalResults = node.getElementsByTagName("TotalResults")[0].innerText;
            this.totalPages = node.getElementsByTagName("TotalPages")[0].innerText;
        }
            
        function Images(options) {
            return {
                small: options.small,
                medium: options.medium,
                large: options.large,
                    
                getLargest: function(){
                    if(this.large) {
                        return this.large;
                    } else if (this.medium) {
                        return this.medium;
                    } else {
                        return this.small;
                    }
                }
            };
        }
            
            

        function getDetails(params) {
            function getItems(xmlDoc) {
                var itemNodes = xmlDoc.getElementsByTagName("Item");
                var items = itemNodes.map(function (itemNode) {
                    return new Item(itemNode);
                });

                return items;
            }


            return new WinJS.Promise(function(comp, err) {

                //var url = "http://ecs.amazonaws.co.uk/onca/xml?Service=AWSECommerceService&AWSAccessKeyId=AKIAJOHMUMYIJ43O4DJQ&Operation=ItemSearch&Author=Homer&ResponseGroup=ItemAttributes,Images,Variations&SearchIndex=Books&Sort=salesrank&AssociateTag=mytag-20";
                var url = buildUrl(params);
                url = getSignature(url);

                var xml;
                WinJS.xhr({ url: url }).done(
                    function completed(request) {
                        // handle completed download.
                        xml = request.response;

                        // Prepare load settings.
                        var loadSettings = new Windows.Data.Xml.Dom.XmlLoadSettings;
                        loadSettings.prohibitDtd = false;
                        loadSettings.resolveExternals = false;

                        // Load XML - Important: We do this before opening the transaction to talk to the database, so the transaction won't expire.
                        var doc = new Windows.Data.Xml.Dom.XmlDocument();
                        doc.loadXml(xml, loadSettings);

                        var response = new Response(doc);
                                
                        comp(response);
                    },
                    function error(request) {
                        // handle error conditions.
                        console.log('error');
                    },
                    function progress(request) {
                        // report on progress of download.
                    });
            });
        }

        return {
            getDetails: getDetails
        };
    }
    
    return {
        loadKeys: loadKeys,
        getSignature: getSignature,
        bookSearch: new BookSearch()
    };
});
