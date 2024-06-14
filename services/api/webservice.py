#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# This file is part of Flower.
#
# Copyright ©2018 Nicolò Mazzucato
# Copyright ©2018 Antonio Groza
# Copyright ©2018 Brunello Simone
# Copyright ©2018 Alessio Marotta
# DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
#
# Flower is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# Flower is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Flower.  If not, see <https://www.gnu.org/licenses/>.

import traceback

import nilsimsa
from flask import Flask, Response, send_file

from configurations import services, traffic_dir, start_date, tick_length, flag_regex, pswd
from pathlib import Path
from data2req import convert_flow_to_http_requests, convert_single_http_requests
from base64 import b64decode
from db import DB
from bson import json_util
from flask_cors import CORS
from flask import request

from flow2pwn import flow2pwn

# lib for basic auth
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash

application = Flask(__name__)
application.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024 * 1024
CORS(application)
db = DB()

# user and iniziliazation for basic auth
users ={"tulip": generate_password_hash(pswd)}
auth = HTTPBasicAuth()
@auth.verify_password
def verify_password(username, password):
    if username in users and \
            check_password_hash(users.get(username), password):
        return username

def return_json_response(object):
    return Response(json_util.dumps(object), mimetype='application/json')

def return_text_response(object):
    return Response(object, mimetype='text/plain')


@application.route('/')
@auth.login_required
def hello_world():
    return 'Hello, World!'

@application.route('/tick_info')
@auth.login_required
def getTickInfo():
    data = {
        "startDate": start_date,
        "tickLength": tick_length
    }
    return return_json_response(data)

@application.route('/query', methods=['POST'])
@auth.login_required
def query():
    filter = request.get_json()
    result = db.getFlowList(filter)
    similarity = int(filter["similarity"]) if "similarity" in filter else 90

    # adapt similarity to nilsimsa compare value
    similarity = (similarity*256/100) - 128

    if "includeFuzzyHashes" in filter:
        result = [x for x in result if all(nilsimsa.compare_digests(hash, x["fuzzy_hash"]) >= similarity for hash in filter["includeFuzzyHashes"])]
        for x in result:
            x['similarity'] = ((sum(nilsimsa.compare_digests(hash, x["fuzzy_hash"]) for hash in filter["includeFuzzyHashes"]) / len(filter["includeFuzzyHashes"]))+128)/256

    if "excludeFuzzyHashes" in filter:
        result = [x for x in result if all(nilsimsa.compare_digests(hash, x["fuzzy_hash"]) < similarity for hash in filter["excludeFuzzyHashes"])]
        for x in result:
            similarity = ((-sum(nilsimsa.compare_digests(hash, x["fuzzy_hash"]) for hash in filter["excludeFuzzyHashes"]) / len(filter["excludeFuzzyHashes"]))+128)/256
            x['similarity'] = (similarity + x['similarity'])/2 if 'similarity' in x else similarity


    return return_json_response(result)

@application.route('/tags')
@auth.login_required
def getTags():
    result = db.getTagList()
    return return_json_response(result)

@application.route('/signature/<id>')
@auth.login_required
def signature(id):
    result = db.getSignature(int(id))
    return return_json_response(result)

@application.route('/star/<flow_id>/<star_to_set>')
@auth.login_required
def setStar(flow_id, star_to_set):
    db.setStar(flow_id, star_to_set != "0")
    return "ok!"


@application.route('/services')
@auth.login_required
def getServices():
    return return_json_response(services)


@application.route('/flag_regex')
def getFlagRegex():
    return return_json_response(flag_regex)


@application.route('/flow/<id>')
@auth.login_required
def getFlowDetail(id):
    to_ret = return_json_response(db.getFlowDetail(id))
    return to_ret


@application.route('/to_single_python_request', methods=['POST'])
@auth.login_required
def convertToSingleRequest():
    flow_id = request.args.get("id", "")
    if flow_id == "":
        return return_text_response("There was an error while converting the request:\n{}: {}".format("No flow id", "No flow id param"))
    #TODO check flow null or what
    flow = db.getFlowDetail(flow_id)
    if not flow:
        return return_text_response("There was an error while converting the request:\n{}: {}".format("Invalid flow", "Invalid flow id"))
    data = b64decode(request.data)
    tokenize = request.args.get("tokenize", False)
    use_requests_session = request.args.get("use_requests_session", False)
    try:
        converted = convert_single_http_requests(data, flow, tokenize, use_requests_session)
    except Exception as ex:
        return return_text_response("There was an error while converting the request:\n{}: {}".format(type(ex).__name__, traceback.format_exc()))
    return return_text_response(converted)

@application.route('/to_python_request/<id>')
@auth.login_required
def convertToRequests(id):
    #TODO check flow null or what
    flow = db.getFlowDetail(id)
    if not flow:
        return return_text_response("There was an error while converting the request:\n{}: {}".format("Invalid flow", "Invalid flow id"))
    tokenize = request.args.get("tokenize", True)
    use_requests_session = request.args.get("use_requests_session", True)
    try:
        converted = convert_flow_to_http_requests(flow, tokenize, use_requests_session)
    except Exception as ex:
        return return_text_response("There was an error while converting the request:\n{}: {}".format(type(ex).__name__, traceback.format_exc()))
    return return_text_response(converted)

@application.route('/to_pwn/<id>')
@auth.login_required
def confertToPwn(id):
    flow = db.getFlowDetail(id)
    converted = flow2pwn(flow)
    return return_text_response(converted)

@application.route('/download/')
@auth.login_required
def downloadFile():
    filepath = request.args.get('file')
    if filepath is None:
        return return_text_response("There was an error while downloading the requested file:\n{}: {}".format("Invalid 'file'", "No 'file' given"))
    filepath = Path(filepath)

    # Check for path traversal by resolving the file first.
    filepath = filepath.resolve()
    if not traffic_dir in filepath.parents:
        return return_text_response("There was an error while downloading the requested file:\n{}: {}".format("Invalid 'file'", "'file' was not in a subdirectory of traffic_dir"))

    try:
        return send_file(filepath, as_attachment=True)
    except FileNotFoundError:
        return return_text_response("There was an error while downloading the requested file:\n{}: {}".format("Invalid 'file'", "'file' not found"))

# API for uploading files
# curl example: curl -F "file=@<path_to_file>" http://localhost:5000/upload -u tulip:<password>
@application.route('/upload', methods=['POST'])
@auth.login_required
def uploadFile():
    if 'file' not in request.files:
        return return_text_response("There was an error while uploading the file:\n{}: {}".format("Invalid 'file'", "No 'file' given"))
    file = request.files['file']
    if file.filename == '':
        return return_text_response("There was an error while uploading the file:\n{}: {}".format("Invalid 'file'", "No 'file' given"))
    if file:
        file.save(traffic_dir / file.filename)
        return return_text_response("ok!")


if __name__ == "__main__":
    application.run(host='0.0.0.0',threaded=True)

