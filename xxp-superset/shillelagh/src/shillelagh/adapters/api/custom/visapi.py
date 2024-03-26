from shillelagh.adapters.base import Adapter
from shillelagh.fields import Field, String, Integer, Order, DateTime, Float
from shillelagh.filters import Filter
from shillelagh.filters import Range
from shillelagh.typing import RequestedOrder

import requests
import os
from typing import Any, Dict, Iterator, List, Optional, Tuple, Union, cast
from datetime import datetime, timezone, date, timedelta
import urllib.parse

class VisualizationAPI(Adapter):
    """
    An adapter for Visualization of Data 
    """
    url = "http://localhost:8090/api"
    safe = True

    @staticmethod
    def supports(uri: str, fast: bool = True, **kwargs: Any) -> Optional[bool]:
        parsed = urllib.parse.urlparse(uri)
        query_string = urllib.parse.parse_qs(parsed.query)
        return (
                parsed.netloc == "api.visapi.com"
                and ("table" in query_string)
        )

    @staticmethod
    # Union[Tuple[str], Tuple[str]]
    # Parses the uri to get the table name
    def parse_uri(uri: str) -> Union[str, Tuple[str]]:
        parsed = urllib.parse.urlparse(uri)
        query_string = urllib.parse.parse_qs(parsed.query)
        table = query_string["table"][0]
        # measures = [eval(i) for i in query_string["measures"]][0]  # convert to integers
        return [table]

    #  measures: list[int]
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
            **kwargs: Any,
    ) -> Iterator[Dict[str, Any]]:
        """
        Yield rows.

        The ``get_rows`` method should yield rows as dictionaries. Python native
        types should be used: int, float, str, bytes, bool, ``datetime.datetime``,
        ``datetime.date``, ``datetime.time``.
        """
        yield {"value": 1}
        # get the time predicate
        # query_path = os.path.join(self.url, "datasets", self.schema, self.table, "query")
        # time_range = bounds.get("datetime", Range())
        # today = int(date.today().strftime("%s")) * 1000
        # begin = 0
        # query = {
        #     "from": time_range.start.timestamp() * 1000 if time_range.start else begin,
        #     "to": time_range.end.timestamp() * 1000 if time_range.end else today,
        #     "measures": self.measures,
        #     "filter": {},
        #     "viewPort": {"width": 1000, "height": 600},
        #     "accuracy": 0.95
        # }
        # params = {"farmName": self.schema, "id": self.table}
        # headers = {'Content-Type': 'application/json'}

        # response = requests.post(query_path, json=query, params=params, headers=headers)
        # payload = response.json()
        # for record in payload["data"]["2"]:  # 2 is the measure
        #     dt = datetime.fromtimestamp(int(record["timestamp"]) / 1000)
        #     yield {
        #         "datetime": dt,
        #         "value": float(record["value"]),
        #     }

    def get_columns(self) -> Dict[str, Field]:
        return {"datetime": DateTime(filters=[Range], exact=False, order=Order.ASCENDING),  # datetime field
                "value": Float()}  # variable field

# from shillelagh.adapters.base import Adapter
# from shillelagh.fields import Field, String, Integer, Order, DateTime, Float
# from shillelagh.filters import Filter
# from shillelagh.filters import Range
# from shillelagh.typing import RequestedOrder

# import requests
# import os
# from typing import Any, Dict, Iterator, List, Optional, Tuple, Union, cast
# from datetime import datetime, timezone, date, timedelta
# import urllib.parse


# class TimeSeriesAPI(Adapter):
#     """
#     An adapter for Time Series Data from MinMaxCache
#     """
#     url = "http://localhost:8090/api"
#     safe = True

#     @staticmethod
#     def supports(uri: str, fast: bool = True, **kwargs: Any) -> Optional[bool]:
#         parsed = urllib.parse.urlparse(uri)
#         query_string = urllib.parse.parse_qs(parsed.query)
#         return (
#                 parsed.netloc == "api.tsapi.com"
#                 and ("schema" in query_string and "table" in query_string and "measures" in query_string)
#         )

#     @staticmethod
#     # Parses the uri to get the schema and table name
#     def parse_uri(uri: str) -> Union[Tuple[str], Tuple[str, str, list[int]]]:
#         parsed = urllib.parse.urlparse(uri)
#         query_string = urllib.parse.parse_qs(parsed.query)
#         schema = query_string["schema"][0]
#         table = query_string["table"][0]
#         measures = [eval(i) for i in query_string["measures"]][0]  # convert to integers
#         return schema, table, measures

#     def __init__(self, schema: str, table: str, measures: list[int]):
#         """
#         Instantiate the adapter.

#         Here ``uri`` will be passed from the ``parse_uri`` method, while
#         ``api_key`` will come from the connection arguments.
#         """
#         super().__init__()
#         self.schema = schema
#         self.table = table
#         self.measures = measures


#     def get_rows(
#             self,
#             bounds: Dict[str, Filter],
#             order: List[Tuple[str, RequestedOrder]],
#             **kwargs: Any,
#     ) -> Iterator[Dict[str, Any]]:
#         """
#         Yield rows.

#         The ``get_rows`` method should yield rows as dictionaries. Python native
#         types should be used: int, float, str, bytes, bool, ``datetime.datetime``,
#         ``datetime.date``, ``datetime.time``.
#         """
#         # get the time predicate
#         query_path = os.path.join(self.url, "datasets", self.schema, self.table, "query")
#         time_range = bounds.get("datetime", Range())
#         today = int(date.today().strftime("%s")) * 1000
#         begin = 0
#         query = {
#             "from": time_range.start.timestamp() * 1000 if time_range.start else begin,
#             "to": time_range.end.timestamp() * 1000 if time_range.end else today,
#             "measures": self.measures,
#             "filter": {},
#             "viewPort": {"width": 1000, "height": 600},
#             "accuracy": 0.95
#         }
#         params = {"farmName": self.schema, "id": self.table}
#         headers = {'Content-Type': 'application/json'}

#         response = requests.post(query_path, json=query, params=params, headers=headers)
#         payload = response.json()
#         for record in payload["data"]["2"]:  # 2 is the measure
#             dt = datetime.fromtimestamp(int(record["timestamp"]) / 1000)
#             yield {
#                 "datetime": dt,
#                 "value": float(record["value"]),
#             }

#     def get_columns(self) -> Dict[str, Field]:
#         return {"datetime": DateTime(filters=[Range], exact=False, order=Order.ASCENDING),  # datetime field
#                 "value": Float()}  # variable field
