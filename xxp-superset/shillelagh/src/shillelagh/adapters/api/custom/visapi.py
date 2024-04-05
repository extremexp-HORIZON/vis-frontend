from shillelagh.adapters.base import Adapter
from shillelagh.fields import Field, String, Integer, Order, DateTime, Float
from shillelagh.filters import Filter
from shillelagh.filters import Range
from shillelagh.typing import RequestedOrder

import json
import requests
import os
from typing import Any, Dict, Iterator, List, Optional, Tuple, Union, Set, cast
from datetime import datetime
import urllib.parse

class VisualizationAPI(Adapter):
    """
    An adapter for Visualization of Data 
    """
    url = "http://host.docker.internal:8080/api/visualization/"
    supports_limit = True
    supports_requested_columns = False
    columns = {}

    @staticmethod
    def supports(uri: str, fast: bool = True, **kwargs: Any) -> Optional[bool]:
        parsed = urllib.parse.urlparse(uri)
        query_string = urllib.parse.parse_qs(parsed.query)
        return (
                parsed.netloc == "api.visapi.com"
                and ("table" in query_string)
        )

    @staticmethod
    # Parses the uri to get the table name
    def parse_uri(uri: str) -> Union[str, Tuple[str]]:
        parsed = urllib.parse.urlparse(uri)
        query_string = urllib.parse.parse_qs(parsed.query)
        table = query_string["table"][0]
        return [table]

    # measures: list[int]
    def __init__(self, table: str):
        """
        Instantiate the adapter.
        Here ``table`` will be passed from the ``parse_uri`` method.
        """
        super().__init__()
        self.table = table

    def get_rows(
            self,
            bounds: Dict[str, Filter],
            order: List[Tuple[str, RequestedOrder]],
            requested_columns: Optional[Set[str]] = set(),
            limit: Optional[int] = None,
            **kwargs: Any,
    ) -> Iterator[Dict[str, Any]]:
        """
        Yield rows.

        The ``get_rows`` method should yield rows as dictionaries. Python native
        types should be used: int, float, str, bytes, bool, ``datetime.datetime``,
        ``datetime.date``, ``datetime.time``.
        """
        # Get filters from bounds
        filters = self.get_filters(bounds)
        print(bounds)
        print(requested_columns)
        # Request
        query = {
            "visualizationType": "line",
            "columns": list(requested_columns),
            "aggFucntion": "AVG",
            "groupBy": [],
            "filters": filters,
            "constraints": {},
            "taskId": "1",
            "limit": limit,
        }

        print(query)
        params = {} # url parameters
        headers = {'Content-Type': 'application/json'} # headers
        query_path = os.path.join(self.url, "data", self.table) # endpoint
        response = requests.post(query_path, json=query, params=params, headers=headers)
        # Now you can check the response status and process it accordingly
        if response.status_code == 200:
            # Process the response data
            data = json.loads(response.json()["data"])
            for record in data:
                # Further processing
                yield self.convert_types(record)
        else:
            # Handle errors
            print("Error:", response.status_code)
    
    def convert_table_saw_columns_to_shillelagh(self, columns: List[any]) -> Dict[str, Field]:
        shillelagh_mapping = {
            "STRING": String,
            "INTEGER": Integer,
            "FLOAT": Float,
            "DOUBLE": Float,
            "LOCAL_DATE_TIME": DateTime,
        }
        shillelagh_columns = {}
        for column in columns:
            column_name = column["name"]
            column_type = column["type"]
            shillelagh_column_type = shillelagh_mapping.get(column_type)
            shillelagh_columns[column_name] = shillelagh_column_type(
                filters=[Range], exact=False, order=Order.ASCENDING
            )
        self.columns = shillelagh_columns
        print(self.columns)
        return shillelagh_columns
        
    def get_columns(self) -> Dict[str, Field]:
        if(not self.columns):
            query_path = os.path.join(self.url, "data", self.table, "columns")
            response = requests.get(query_path)
            payload = response.json()
            return self.convert_table_saw_columns_to_shillelagh(payload)
        else:
            return self.columns

    # Function to convert types
    def convert_types(self, record) -> Dict[str, any]:
        for key, value in record.items():
            column_type = self.columns.get(key)
            if isinstance(column_type, DateTime):
                # Convert value to DateTime
                record[key] = datetime.fromisoformat(value)
            elif isinstance(column_type, Float):
                # Convert value to Float
                record[key] = float(value)
            elif isinstance(column_type, Integer):
                # Convert value to Integer
                record[key] = int(value)
        return record
    
    def get_filters(self, bounds) -> List[Dict]:
        filters = []
        for column, condition in bounds.items():
            # print(condition.__class__.__name__)
            if(isinstance(condition, Range)):
                column_type = self.columns.get(column) # Type of filtered column
                min = condition.start
                max = condition.end
                if isinstance(column_type, DateTime) or isinstance(column_type, String):
                    min = str(min)
                    max = str(max)
                f = {
                    "column" : column,
                    "type" : "range",
                    "value": {
                        "min": min,
                        "max": max
                    }
                }
            else:
                continue;
            filters.append(f)
        return filters